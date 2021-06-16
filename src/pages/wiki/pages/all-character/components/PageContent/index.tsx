import React, { useState, useRef, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'

import { Iconfont, CharacterCard, Pagination, Back, CustomScrollView, StatusBar } from "@components";
import { getCharacter } from '@service'
import { CharacterType, PaginationType, CharacterFilterType } from '@constants/types'
import { defaultSixCharacters } from '@constants/wiki'
import { formatFilter } from '@utils'

import { AllCharacterPageContentProps } from '../../type'
import '../../index.less'


const defaultPagination: PaginationType = {
  count: -1,
  pages: 1,
  cur: 1,
}

const AllCharacterPageContent: React.FC<AllCharacterPageContentProps> = (props) => {
  const { openDrawer, closeDrawer, filter, reqTrigger, setReqTrigger } = props
  const [characters, setCharacters] = useState<CharacterType[]>(defaultSixCharacters)
  const [pagination, setPagination] = useState<PaginationType>(defaultPagination)
  const ScrollViewRef = useRef() as React.MutableRefObject<any>

  // 滚到顶部
  const scrollTop = useCallback(() => {
    if (process.env.TARO_ENV === 'rn') {
      ScrollViewRef.current.scrollTo({ y: 0 })
    } else {
      // 直接操控TaroElement，实现滚动到顶部。ref.current返回的就是一个TaroElement
      ScrollViewRef.current.setAttribute('scrollTop', 0)
    }
  }, [ScrollViewRef])

  // 触发请求
  const sendRequest = useCallback((
    pagination_: PaginationType,
    filter_: CharacterFilterType,
  ) => {

    Taro.showLoading({
      title: '加载中',
      mask: true,
    })
    scrollTop()  // 触发滚到顶部
    closeDrawer()  // 触发关闭drawer
    return getCharacter.filt({
      ...formatFilter<CharacterFilterType>(filter_),
      page: pagination_.cur
    })
      .then(data => {
        const { info: { count, pages }, results } = data
        setCharacters(results)
        Taro.hideLoading()
        if (pagination_.count === -1) {
          setPagination({
            count,
            pages,
            cur: 1,
          })
        }
      })
  }, [closeDrawer, scrollTop])

  // 控制什么时候发起请求
  // reqTrigger.trigger === true: 立即触发请求
  // reqTrigger.firstFilter === true: 点击“检索”，需重置pagination
  useEffect(() => {
    if (reqTrigger.trigger) {
      if (reqTrigger.firstFilter) {
        sendRequest(defaultPagination, filter)
      } else {
        sendRequest(pagination, filter)
      }
      setReqTrigger({
        trigger: false,
        firstFilter: false
      })
    }
  }, [reqTrigger, setReqTrigger, pagination, filter, sendRequest])


  return (
    <View className='all-c' >
      <StatusBar barStyle='dark-content' backgroundColor='rgba(0,0,0,0)' translucent />

      <View className='all-c-header'>
        <Back className='all-c-back' />
        <View className='all-c-header-btn'>
          <Text className='all-c-header-btn-text'>{pagination.count < 0 ? '' : pagination.count}</Text>
        </View>
        <Button
          className='all-c-header-btn'
          onClick={openDrawer}
          hoverClass='all-c-header-btn_active'
          hoverStyle={{ opacity: 0.6 }}
        >
          <Iconfont name='sousuo' size={56} />
        </Button>
      </View>

      <CustomScrollView className='all-c-scroll' ref={ScrollViewRef} >
        <View className='all-c-content'>
          {
            characters.map((character, index) => (
              <CharacterCard
                key={character.id}
                character={character}
                showImage={false}
                number={(pagination.cur - 1) * 20 + index + 1}
              />
            ))
          }
        </View>
        <Pagination
          pagination={pagination}
          setPagination={setPagination}
          setReqTrigger={setReqTrigger}
        />
      </CustomScrollView>
    </View>
  )
}

export default AllCharacterPageContent
