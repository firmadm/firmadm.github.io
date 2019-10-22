export const CAPTURE = 'CAPTURE';
export const CLEAR = 'CLEAR';
export const capture = payload => {
  return {
    type: CAPTURE,
    payload: payload
  };
};
export const clear = () => {
  return {
    type: CLEAR
  };
};