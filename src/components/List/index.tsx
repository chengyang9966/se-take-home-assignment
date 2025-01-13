import { List, Typography } from 'antd'
import React from 'react'

interface ListProps<T> {
dataSource: T[];
title: string;
renderItem: (item: T, index: number) => React.ReactNode; 
}

const CustomList = <T,>(props: ListProps<T>) => {
  return (
    <List 
    style={{
      marginTop: 20,
      marginRight:10,
      marginLeft:10,
    }}

    pagination={{
      pageSize: 5,
      hideOnSinglePage: true,
    }}

    itemLayout="vertical"
    renderItem={props.renderItem}
    dataSource={props.dataSource}
    header={<Typography.Title level={4}>{props.title}</Typography.Title>}

    />
  )
}

export default CustomList