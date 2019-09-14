import React, {Component} from 'react'
import {
	Card,
	Button,
	Table,
	Modal,
	message
} from 'antd'

import {formateDate} from '../../utils/dateUtils'
import LinkButton from '../../components/link-button'
import {PAGE_SIZE} from '../../utils/constants'
import {reqUsers, reqDeleteUser, reqAddOrUpdateUser} from '../../api'
import UserForm from './user-form'

/*
  用户路由
 */
export default class User extends Component {
  
    state = {
	   users: [],         //所有用户列表
	   roles: [],         //用户所属角色
	   isShow: false,     //表示是否显示确认框
	}
	
	initColumns = () => {
		this.columns = [
			{
				title: '用户名',
				dataIndex: 'username'
			},
			{
				title: '邮箱',
				dataIndex: 'email'
			},
			{
				title: '电话',
				dataIndex: 'phone'
			},
			{
				title: '注册时间',
				dataIndex: 'create_time',
				render: formateDate
			},
			{
				title: '所属角色',
				dataIndex: 'role_id',
				render: (role_id) => this.roleNames[role_id]
			},
			{
				title: '操作',
				render: (user) => (
				   <span>
				      <LinkButton onClick={() => this.showUpdate(user)}>修改</LinkButton>
					  <LinkButton onClick={() => this.deleteUser(user)}>删除</LinkButton>
				   </span>
				)
			}
		]
	}
	
	/*
	   显示修改页面
	*/
	showUpdate = (user) => {
		//保存，标识这是修改
		this.user = user
		this.setState({
		   isShow: true	
		})
	}
	
	/*
	   显示添加界面
	*/
    showAdd = () => {
	   //删除前面保存的user
	   this.user = null
	   this.setState({
	      isShow: true	
	   })
    }
	
	/*
	   删除指定用户
	*/
    deleteUser = (user) => {
	   Modal.confirm({
		   title: `确认删除${user.username}吗?`,
		   onOk: async () => {
			  const result = await reqDeleteUser(user._id)
			  if(result.status === 0) {
				  message.success('删除用户成功!')
				  this.getUsers()
			  }
		   }
	   })
    }
	
	/*
	   添加/修改用户
	*/
	addOrUpdateUser = async () => {
		
		this.setState({isShow: false})
		
		//1.搜集数据
		const user = this.form.getFieldsValue()
		this.form.resetFields()
		
		//如果是更新，需要给user指定_id属性
		if(this.user) {
			user._id = this.user._id
		}
		
		//2.发送请求
		const result = await reqAddOrUpdateUser(user)
		//3.更新列表显示
		if(result.status === 0) {
			message.success(`${this.user ? '修改' : '添加'}用户成功!`)
			this.getUsers()
		}
	}
	
	/*
	   根据roles的数组，生成包含所有角色的对象(属性名用角色id值)
	*/
	initRoleNames = (roles) => {
		const roleNames = roles.reduce((pre, role) => {
			pre[role._id] = role.name
			return pre
		},[])
		//保存
		this.roleNames = roleNames
	}
	
	getUsers = async () => {
		const result = await reqUsers()
		if(result.status === 0) {
			const {users, roles} = result.data
			this.initRoleNames(roles)
			this.setState({
				users,
				roles
			})
		}
	}
	
	componentWillMount() {
		this.initColumns()
	}
	
	componentDidMount() {
		this.getUsers()
	}
  
    render() {
		
		const {users, isShow, roles} = this.state
		const user = this.user || {}
		
		const title = <Button type="primary" onClick={this.showAdd}>创建用户</Button>
		
		return (
		   <Card title={title}>
		      <Table
		        bordered
			    rowKey='_id'
		        dataSource={users}
				columns={this.columns}
				pagination={{
				    defaultPageSize: 3,
				    showQuickJumper: true
				}}
		      />
			  
			  <Modal
				title={user._id ? "修改用户" : "添加用户"}
				visible={isShow}
				onOk={this.addOrUpdateUser}
				onCancel={() => {
					this.setState({isShow: false})
					this.form.resetFields()
				}}
			  >
				 <UserForm
				    setForm={form => this.form = form}
					roles={roles}
					user={user}
				  />
			  </Modal>
		   </Card>
		)
	}
 
}
