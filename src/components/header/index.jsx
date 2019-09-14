import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import { Modal} from 'antd'

import {reqWeather} from '../../api'
import menuList from '../../config/menuConfig'
import {formateDate} from '../../utils/dateUtils'
import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'
import LinkButton from '../link-button'
import './index.less'

/*
 左侧导航的组件
*/
class Header extends Component {
  
    state = {
		currentTime: formateDate(Date.now()),
		dayPictureUrl: '',
		weather: ''
	}
	
	getTime = () => {
		this.intervalId = setInterval(() => {
		   const currentTime = formateDate(Date.now())
		   this.setState({currentTime})
		},1000)
	}
	
	getWeather = async () => {
	  const {dayPictureUrl, weather} = await reqWeather('郑州',)
	  this.setState({
		  dayPictureUrl,
		  weather
	  })
	}
	
	getTitle = () => {
		const path = this.props.location.pathname
		let title
		menuList.forEach(item => {
			if(item.key === path) {
				title = item.title
			} else if(item.children) {
				const cItem = item.children.find(cItem => path.indexOf(cItem.key) === 0)
			    if(cItem) {
					title = cItem.title
				}
			}
		})
		return title
	}
	
	/*
	  退出登录
	*/
	logout = () => {
		Modal.confirm({
			content: '确认退出吗？',
			onOk: () => {
				//删除保存的user数据
				storageUtils.removeUser()
				memoryUtils.user = {}
				
				//跳转到登录页面
				this.props.history.replace('/login')
			},
			onCancel() {
				
			}
		})
	}
	
	componentDidMount() {
		this.getTime()
		this.getWeather()
	}
	
	/*
	  当前组件卸载之前调用
	*/
	componentWillUnmount() {
		//清除定时器
		clearInterval(this.intervalId)
	}
	
    render() {
		const {currentTime, dayPictureUrl, weather} = this.state
		const username = memoryUtils.user.username
		const title = this.getTitle()
		return (
		   <div className="header">
		      <div className="header-top">
			    <span>欢迎, {username}</span>
				<LinkButton onClick={this.logout}>退出</LinkButton>
			  </div>
			  <div className="header-bottom">
			    <div className="header-bottom-left">{title}</div>
				<div className="header-bottom-right">
				  <span>{currentTime}</span>
				  <img src={dayPictureUrl} alt="weather" />
				  <span>{weather}</span>
				</div>
			  </div>
		   </div>
		)
	}
 
}

export default withRouter(Header)
