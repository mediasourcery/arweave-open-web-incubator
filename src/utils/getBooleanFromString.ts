export const getBooleanFromString = (str: string) => {
  if (str === 'true' || str === 'yes' || str === '1') {
    return true;
  }
  return false;
};
