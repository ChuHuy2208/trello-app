export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

/** 
 * Phía FE sẽ tư tạo ra một card đặc biệt placeholder card, không liên quan tới Back-end
 * Card đặc biệt này được ẩn ở giao diện UI người dùng
 * Cấu trúc Id của card này để Unique rất đơn giản, không cần phải làm random phức tạp: 
 * "columnId-placeholder-card" (mỗi column chỉ có thể có tối đa 1 placeholder card)
 * Quan trọng khi tạo: phải đầy đủ (_id, boardId, columnId, FE_PlaceholderCard)
*/
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}
