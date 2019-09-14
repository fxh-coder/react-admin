/*
包含n个日期时间处理的工具函数模块
*/

/*
  格式化日期
*/
export function formateDate(time) {
  if (!time) return ''
  let date = new Date(time)
  
  const month = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)
  const day = date.getDate() >= 10 ? date.getDate() : "0" + date.getDate()
  const hour = date.getHours() >= 10 ? date.getHours() : "0" + date.getHours()
  const minute = date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes()
  const second = date.getSeconds() >= 10 ? date.getSeconds() : "0" + date.getSeconds()
  return date.getFullYear() + '-' + month + "-" + day + " " + hour + ":" + minute + ":" + second    
}