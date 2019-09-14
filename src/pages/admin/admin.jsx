import React, { Component } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { Layout } from 'antd'

/*
  后台管理的路由组件
*/

import memoryUtils from '../../utils/memoryUtils'
import Header from '../../components/header'
import LeftNav from '../../components/left-nav'
import NotFound from '../not-found/not-found'
import Home from '../home/home'
import Category from '../category/category'
import Product from '../product/product'
import Role from '../role/role'
import Order from '../order/order'
import User from '../user/user'
import Bar from '../charts/bar'
import Line from '../charts/line'
import Pie from '../charts/pie'

const { Footer, Sider, Content } = Layout


export default class Admin extends Component {
	
	 
	render () {
		
		const user = memoryUtils.user
		if(!user || !user._id) {
			return <Redirect to='/login' /> 
		}
		
		return (
		  <Layout style={{minHeight: '100%'}}>
		    <Sider>
		      <LeftNav/>
		    </Sider>
		    <Layout>
		      <Header>Header</Header>
		      <Content style={{margin: 20, backgroundColor: '#fff'}}>
		        <Switch>
				  <Redirect from='/' exact to='/home'/>
		          <Route path='/home' component={Home} />
				  <Route path='/category' component={Category} />
				  <Route path='/product' component={Product} />
				  <Route path='/role' component={Role} />
				  <Route path='/user' component={User} />
				  <Route path='/order' component={Order} />
				  <Route path='/charts/bar' component={Bar} />
				  <Route path='/charts/line' component={Line} />
				  <Route path='/charts/pie' component={Pie} />
		          <Route component={NotFound}/>
		        </Switch>
		      </Content>
		      <Footer style={{textAlign: 'center', color: '#cccccc'}}>推荐使用谷歌浏览器，可以获得更佳页面操作体验</Footer>
		    </Layout>
		  </Layout>
		)
	}
}