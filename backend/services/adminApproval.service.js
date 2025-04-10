const mongoose = require('mongoose');
const EnumConfig = require('../models/enumConfig.model');
const PointsConfig = require('../models/pointsConfig.model');
const Admin = require('../models/admin.model');

// Model for configuration change requests
const ConfigChangeRequest = mongoose.model('ConfigChangeRequest', new mongoose.Schema({
  requestType: {
    type: String,
    enum: ['enum', 'points'],
    required: true
  },
  enumType: {
    type: String,
    required: function() {
      return this.requestType === 'enum';
    }
  },
  configType: {
    type: String,
    required: function() {
      return this.requestType === 'points';
    }
  },
  proposedChanges: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewNotes: String,
  reviewedAt: Date
}, { timestamps: true }));

exports.submitChangeRequest = async (adminId, requestType, data) => {
  try {
    const request = new ConfigChangeRequest({
      requestType,
      ...data,
      requestedBy: adminId
    });
    
    await request.save();
    return request;
  } catch (error) {
    console.error('Error submitting change request:', error);
    throw error;
  }
};

exports.getPendingRequests = async () => {
  try {
    return await ConfigChangeRequest.find({ status: 'pending' })
      .populate('requestedBy', 'name email department')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error getting pending requests:', error);
    throw error;
  }
};

exports.reviewRequest = async (requestId, adminId, decision, notes) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const request = await ConfigChangeRequest.findById(requestId).session(session);
    
    if (!request) {
      throw new Error('Change request not found');
    }
    
    if (request.status !== 'pending') {
      throw new Error('This request has already been reviewed');
    }
    
    // Update request status
    request.status = decision;
    request.reviewedBy = adminId;
    request.reviewNotes = notes;
    request.reviewedAt = new Date();
    
    await request.save({ session });
    
    // If approved, apply the changes
    if (decision === 'approved') {
      if (request.requestType === 'enum') {
        await EnumConfig.findOneAndUpdate(
          { type: request.enumType },
          { 
            values: request.proposedChanges.values,
            lastUpdated: new Date(),
            updatedBy: adminId
          },
          { upsert: true, session }
        );
      } else if (request.requestType === 'points') {
        // Similar to the points update logic in enumConfig.controller.js
        // but simplified for brevity
        const newConfig = new PointsConfig({
          configType: request.configType,
          configuration: request.proposedChanges.configuration,
          updatedBy: adminId,
          notes: request.reviewNotes || 'Approved via change request'
        });
        
        await newConfig.save({ session });
        
        await PointsConfig.updateMany(
          { configType: request.configType, _id: { $ne: newConfig._id } },
          { isActive: false },
          { session }
        );
      }
    }
    
    await session.commitTransaction();
    return request;
  } catch (error) {
    await session.abortTransaction();
    console.error('Error reviewing change request:', error);
    throw error;
  } finally {
    session.endSession();
  }
};