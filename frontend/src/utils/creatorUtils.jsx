/**
 * Checks if a register number belongs to one of the system creators
 * @param {string} registerNo - Student register number to check
 * @returns {boolean} - True if this is a creator's register number
 */
export const isCreator = (registerNo) => {
  const creators = [
    "RA2211003011899", // REVANTH ANAND
    "RA2211026010221", // DHIYA C
    "RA2211026010225"  // A AKHIL
  ];
  return creators.includes(registerNo);
};

/**
 * Get style classes to apply for creator recognition
 * @param {string} registerNo - Student register number to check
 * @param {object} options - Styling options
 * @returns {string} - CSS classes to apply
 */
export const getCreatorStyles = (registerNo, options = {}) => {
  if (!isCreator(registerNo)) return "";
  
  const defaultStyles = "border-2 border-purple-500 bg-gradient-to-r from-gray-900 to-black";
  return options.customStyles || defaultStyles;
};

/**
 * Get creator badge if applicable
 * @param {string} registerNo - Student register number to check
 * @returns {JSX.Element|null} - Creator badge or null
 */
export const getCreatorBadge = (registerNo) => {
  if (!isCreator(registerNo)) return null;
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      Creator
    </span>
  );
};