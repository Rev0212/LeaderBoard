<div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Students</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStudents} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="submittedBy" 
                    tick={{ fill: '#4B5563' }}
                    tickLine={{ stroke: '#4B5563' }}
                  />
                  <YAxis 
                    tick={{ fill: '#4B5563' }}
                    tickLine={{ stroke: '#4B5563' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px'
                    }}
                  />
                  <Bar 
                    dataKey="totalPoints" 
                    fill="#4F46E5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>