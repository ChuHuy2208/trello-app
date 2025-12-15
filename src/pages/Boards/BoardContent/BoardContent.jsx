/* eslint-disable react-hooks/set-state-in-effect */
import Box from '@mui/material/Box'
import Columns from './Columns/Columns'
import { mapOrder } from '~/utils/softs'
import { DndContext, PointerSensor, useSensor, useSensors, MouseSensor, TouchSensor, DragOverlay, defaultDropAnimationSideEffects, closestCorners, closestCenter, pointerWithin, rectIntersection, getFirstCollision } from '@dnd-kit/core'
import { useEffect, useState, useCallback, useRef } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { cloneDeep } from 'lodash'

import Column from './Columns/Column/Column'
import Card from './Columns/Column/Cards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {

  // const pointerSensor = useSensor(PointerSensor, {activationConstraint: { distance: 10 }})
  
  // Yêu cầu chuột di chuyển 10px mới kích hoạt event (fix trường hợp click mà vẫn gọi event)
  const mouseSensor = useSensor(MouseSensor, {activationConstraint: { distance: 10 }})

  // Nhấn giữ 250ms và di chuyển khoảng 5px mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, {activationConstraint: { delay: 250, tolerance: 5 }})

  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] =  useState([])

  // Cùng 1 thời điểm chỉ có một phần tử được kéo thả (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] =  useState(null)
  const [activeDragItemType, setActiveDragItemType] =  useState(null)
  const [activeDragItemData, setActiveDragItemData] =  useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =  useState(null)

  // Điểm va chạm cuối cùng xử lý thuật toán phát hiện va chạm
  const lastOverId = useRef(null)
  
  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  // Tìm 1 column theo cardId
  const findColumnByCardId = (cardId) => {
    // Đoạn này cần lưu ý , nên dùng c.cards thay vì c.cardOrderIds vì ở bước handleDragOver ta sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // function chung xử lý việc cập nhật lại state trong trường hợp di chuyển card giữa các column khác nhau
  const moveCardBetweenColumns = (
    overColumn, 
    activeColumn, 
    overCardId, 
    activeDraggingCardId, 
    activeDraggingCardData,
    active,
    over
  ) => {
    setOrderedColumns(prevColumns => {
      // Tìm vị tri (index) của cái overCard trong column đích (nơi mà activeCard đang được thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // Logic tính toán "cardIndex mới" (trên hoặc dưới của overCard lấy chuẩn từ code của thư viện - dnd-kit)
      let newCardIndex 
      const isBelowOverItem = active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height

      const modifier = isBelowOverItem ? 1 : 0

      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.Card?.length + 1

      // clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      // column cũ
      if (nextActiveColumn) {
        // Xoá card ở cái column active (có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để kéo sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      // column mới
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo có tồn tại trong ovẻrColumn hay chưa, nếu có thì phải xoá đi trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Đổi với dữ liệu dragEnd thì phải cập nhật lại columnId của card sau khi kéo card sang column khác
        // const rebuild_activeDraggingCardData = {
        //   ...activeDraggingCardData,
        //   columnId: nextOverColumn._id
        // }
        // Thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
          }
        )
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      return nextColumns
    })
  }

  // Trigger khi bắt đầu kéo thả
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    // Nếu kéo card thì set giả trị old column
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // Trigger khi kéo thả qua vùng khác
  const handleDragOver = (event) => {
    
    // Không làm gì thêm nếu kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return
    }
    
    // Còn nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các columns
    // console.log('handleDragOver', event)
    const { active, over } = event

    // Kiểm tra nếu không tồn tại over thì return luôn tránh lỗi
    if (!active || !over) return

    // activeDraggingCard: là cái card đang được kéo
    const { id: activeDraggingCardId, data:  { current: activeDraggingCardData } } = active
    // overCard: là cái card đang tương tác với card ở trên hoặc ở dưới khi kéo
    const { id: overCardId } = over

    // Tìm 2 columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // Nếu không tốn tại 1 trong 2 column thì khônng làm gì hết tránh crash trang web
    if (!activeColumn || !overColumn) {
      return
    }

    // Chỉ khi kéo thả card qua 2 column khác nhau, còn nếu kéo card trong columnn ban đầu thì không làm gì 
    // Vì đây là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong thì lại là vấn đề khác tại handleDragEnd
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenColumns(
        overColumn, 
        activeColumn, 
        overCardId, 
        activeDraggingCardId, 
        activeDraggingCardData,
        active,
        over
      )
    }
  }

  // Trigger khi kết thúc kéo thả
  const handleDragEnd = (event) => {
    // console.log(event)
    const { active, over } = event

    // Kiểm tra nếu không tồn tại over thì return luôn tránh lỗi
    if (!active || !over) return

    // Xử lý kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCard: là cái card đang được kéo
      const { id: activeDraggingCardId, data:  { current: activeDraggingCardData } } = active
      // overCard: là cái card đang tương tác với card ở trên hoặc ở dưới khi kéo
      const { id: overCardId } = over

      // Tìm 2 columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // Nếu không tốn tại 1 trong 2 column thì khônng làm gì hết tránh crash trang web
      if (!activeColumn || !overColumn) {
        return
      }

      // Hành động kéo thả giữa 2 column khác nhau
      // Phải dùng tới activeDragItemData.columnId hoặc oldColumnƯhenDraggingCard._id (set vào state từ bước handleDragStart) chứ không phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card đã bị thay đổi
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        // Kéo thả giữa 2 column khác nhau
        moveCardBetweenColumns(
          overColumn, 
          activeColumn, 
          overCardId, 
          activeDraggingCardId, 
          activeDraggingCardData,
          active,
          over,
          pointerWithin,
          rectIntersection,
          getFirstCollision
        )
      } else {
        // Kéo thả card trong cùng 1 column

        // Lấy vị trí cũ của card đang kéo từ oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // Lấy vị trí mới của card đang kéo từ over
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        // Dùng ArrayMove vì kéo card trong 1 column thì tương tự như kéo column trong 1 boardContent
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setOrderedColumns(prevColumns => {
          // clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState
          const nextColumns = cloneDeep(prevColumns)

          // Tìm tới column chúng ta đang thả
          const targetColumn = nextColumns.find(c => c._id === overColumn._id)

          // Cập nhật lại 2 giả trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(c => c._id)

          // trả về giá trị state mới chuẩn vị trí
          return nextColumns
        })
      }
    }

    // Xử lý kéo thả column trong 1 cái boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        // Lấy vị trí cũ của column đang kéo từ active
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        // Lấy vị trí mới của column đang kéo từ over
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)
        // Dùng ArrayMove để sắp xếp lại mảng Columns ban đầu
        // Code của ArrayMove: https://github.com/clauderic/dnd-kit/blob/master/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
  
        // const dndOrderdColumnsIds = dndOrderedColumns.map(c => c._id)
  
        // console.log({dndOrderedColumns})
        // console.log({dndOrderdColumnsIds})
  
        // Cập nhật lại state ban đầu sau khi kéo thả
        setOrderedColumns(dndOrderedColumns)
      }
    }

    // Những dữ liệu sau khi kéo thả này luôn phải đưa về giá trị null
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        }
      }
    })
  }

  // Custom lại thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều column
  // args = arguments = Các đối số, tham số 
  const collisionDetectionStrategy = useCallback((args) => {
    // rường hợp kéo column thì dùng closestCorners là chuẩn nhất
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({...args})
    }

    // Tìm các điểm va chạm giữa intersection với con trỏ
    const pointerIntersection = pointerWithin(args)
    const intersections = pointerIntersection.length > 0 ? pointerIntersection : rectIntersection(args)

    // Tìm overId trong đám intersections ở trên
    let overId = getFirstCollision(intersections, 'id')

    if (overId) {
      console.log('overId before: ', overId)
      // Đoạn này là fix bug flickering
      // Nếu over nó là column thì sẽ tìm tới cái cardId gần nhất bên trong khu vực va chạm đó dựa vào thuật toán phát hiện va chạm closestCenter hoặc closestCorners đều được. Tuy nhiên dùng closestCenter thì sẽ mượt hơn
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        overId = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0?.id]
        console.log('overId after: ', overId)
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    // nếu overId là null thì trả về mảng rỗng - tránh bug crash trang
    return lastOverId.current ? [{id: lastOverId}] : []
  }, [activeDragItemType, orderedColumns])


  return (
    <DndContext
      // cảm biến
      sensors={sensors}
      // thuật toán phát hiện va chạm
      // Nếu chỉ dùng closestCorners thì sẽ bi bug flickering + sai dữ liệu
      // collisionDetection={closestCorners}

      // Tự custom nâng cao thuật toán va chạm
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{
        height: (theme) => theme.trelloCustoms.boardContentHeight,
        bgcolor: (theme) => ( theme.palette.mode === 'dark' ? '#34495e' : '#1976d2' ),
        p: '10px 0',

      }}>
        <Columns columns={orderedColumns}/>
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} isDragOverlay />}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} isDragOverlay />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
