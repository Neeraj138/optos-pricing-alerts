export const isValidObject = (value) => {
    return (
      typeof value === "object" && value !== null && Object.keys(value).length > 0
    );
  };
  
  export const isValidArray = (value) => {
    return Array.isArray(value) && value.length > 0;
  };
  