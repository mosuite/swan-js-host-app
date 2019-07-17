
export const noop = () => {};

/**
 * 对于随机数的模拟, 例如slaveId
 * 
 * @returns 4位随机数
 */
export const randomNum = () => Math.random().toString(10).slice(-5, -1);

/**
 * 对于处理catch的合理提示
 */
export const catchTips = () => {
    console.log('Dont Worry! The following error is that the statement belongs to the overlay catch operation.');
};
