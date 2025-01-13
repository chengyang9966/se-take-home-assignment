import { Order } from '../interface/order'
import { Tag } from 'antd'

const CustomTag = ({status}:{
    status:Order['status']
}) => {
  return (
    <Tag
    color={
        status === "PROCESSING"
        ? "processing"
        : status === "COMPLETED"
        ? "success"
        : "default"
    }
  >
    {status}
  </Tag>
  )
}

export default CustomTag