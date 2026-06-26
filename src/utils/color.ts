// 生成 #xxxxxx 格式随机色
function getRandomHexColor() {
  const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  return `#${hex}`;
}

export { getRandomHexColor };