import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Button, Text, Image } from '@tarojs/components'

import { StatusBar, Loading } from "@components";
import { getCharacter } from '@service'
import { WikiCharacterType } from '@constants/type'

import './index.less'

type selectData = {
  character: WikiCharacterType,
  choice: string,
}

const Game: React.FC<any> = () => {
  // 三个状态：blank、loading、gaming
  const [status, setStatus] = useState<string>('blank')
  const [characters, setCharacters] = useState<WikiCharacterType[]>([])
  const [selectList, setSelectList] = useState<selectData[]>([])
  const [countdown, setCountdown] = useState<number>(7)

  useEffect(() => {
    // 游戏开始执行的初始化逻辑
    const getTenRandomCharacters = async () => {
      // 第一步，获取30个随机的不重复的id列表
      const rids: number[] = []
      for (let i = 0; i < 30; i++) {
        let rid: number
        do {
          rid = Math.floor(Math.random() * 671) + 1
        } while (rids.indexOf(rid) !== -1)
        rids.push(rid)
      }

      // 第二步，请求这30个id，找到10个status都不是unknown的角色
      const chasAll: WikiCharacterType[] = await getCharacter(rids)
      const chas: WikiCharacterType[] = []
      for (const cha of chasAll) {
        if (chas.length > 9) {
          break
        }
        if (cha.status === 'Dead' || cha.status === 'Alive') {
          chas.push(cha)
        }
      }
      setCharacters(chas)
      setStatus('gaming')
    }

    if (status === 'loading') {
      getTenRandomCharacters()
    }

  }, [status])

  const handleClick = () => {
    console.log(11111);
    
  }


  // 未开始游戏
  if (status === 'blank') {
    return (
      <View className='game'>
        <StatusBar barStyle='light-content' backgroundColor='rgba(0,0,0,0)' translucent />
        <View className='game-pre-title'>
          <Text className='game-pre-title-text game-pre-title-text_red'>Dead</Text>
          <Text className='game-pre-title-text'>or</Text>
          <Text className='game-pre-title-text game-pre-title-text_green'>Alive</Text>
        </View>
        <View className='game-pre-comment'>
          <Text className='game-pre-comment-text'>判断每一个出场的角色是Dead还是Alive！</Text>
        </View>
        <Button className='game-pre-btn' onClick={() => setStatus('loading')}>开始</Button>
      </View>
    )
  }

  if (status === 'loading') {
    return (
      <View className='game'>
        <StatusBar barStyle='light-content' backgroundColor='rgba(0,0,0,0)' translucent />
        <Loading />
      </View>
    )
  }

  const character = characters[selectList.length]

  return (
    <View className='game'>
      <StatusBar barStyle='light-content' backgroundColor='rgba(0,0,0,0)' translucent />
      <View className='game-countdown'>
        <Text className='game-countdown-text'>{countdown}</Text>
      </View>
      <Image src={character.image} className='game-img' mode='widthFix' />
      <View className='game-name'>
        <Text className='game-name-text'>{character.name}</Text>
      </View>
      <View className='game-location'>
        <Text className='game-location-text'>{character.location.name}</Text>
      </View>
      <View className='game-btns'>
        <Button className='game-btns-btn game-btns-btn_dead' onClick={handleClick} hoverClass='game-btns-btn_active' hoverStyle='game-btns-btn_active'>
          {/* <Text className='game-btns-btn-text'>Dead</Text> */}
        </Button>
        <Button className='game-btns-btn game-btns-btn_alive'>
          <Text className='game-btns-btn-text'>Alive</Text>
        </Button>
      </View>
      <View className='game-count'>
        <Text className='game-count-text'>{`${selectList.length + 1} / ${characters.length}`}</Text>
      </View>
    </View>
  )
}

export default Game
