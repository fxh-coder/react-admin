import React, {Component} from 'react'
import {
	Card,
	Table,
	Button,
	Modal,
	message
} from 'antd'

import {PAGE_SIZE} from '../../utils/constants'
import {reqRoles, reqAddRole, reqUpdateRole} from '../../api'
import AddForm from './add-form'
import AuthForm from './auth-form'
import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'
import {formateDate} from '../../utils/dateUtils'

/*
  角色路由
 */
export default class Role extends Component {
  
    state = {
		roles: [],             //所有角色的列表
		role: {},              //选中的role
		isShowAdd: false,      //是否显示添加界面
		isShowAuth: false,     //是否显示设置权限界面
	}
	
	constructor (props) {
		super(props)
		
		this.auth = React.createRef()
	}
	
	initColumns = () => {
		this.columns = [
			{
				title: '角色名称',
				dataIndex: 'name'
			},
			{
				title: '创建时间',
				dataIndex: 'create_time',
				render: (create_time) => formateDate(create_time)
			},
			{
				title: '授权时间',
				dataIndex: 'auth_time',
				render: formateDate
			},
			{
				title: '授权人',
				dataIndex: 'auth_name'
			}
		]
	}
	
	onRow = (role) => {
		return {
		   onClick: event => {
			  this.setState({
				  role
			  })
		   }
		}
	}
	
	getRoles = async () => {
		const result = await reqRoles()
		if(result.status === 0) {
			const roles = result.data
			this.setState({
				roles
			})
		}
	}
	
	/*
	   添加角色
	*/
	addRole = () => {
		//进行表单验证，通过后向下进行
		this.form.validateFields(async (error, values) => {
			if(!error) {
				//隐藏确认框
				this.setState({
					isShowAdd: false
				})
				
				//1.搜集输入数据
				const {roleName} = values
				this.form.resetFields()
				//2.请求添加
				const result = await reqAddRole(roleName)
				//3.根据结果显示/更新列表显示
				if(result.status === 0) {
					message.success('添加角色成功')
					
					//更新roles状态
					/*
						之前使用的方法
						this.getRoles()
					*/
				   
					const role = result.data
					
					/*
						const roles = [...this.state.roles]
						roles.push(role)
						
						this.setState({
							roles
						})
					*/
				   
				   /*
				      推荐的写法
					  基于原本状态的数据更新
				   */
				   this.setState(state => ({
					   roles: [...state.roles, role]
				   }))
				} else {
					message.error('添加角色失败')
				}
			}
		})
	}
	
	/*
	   更新角色
	*/
	updateRole = async () => {
		
		//隐藏确认框
		this.setState({
			isShowAuth: false
		})
		
		const role = this.state.role
		//得到最新的menus
		const menus = this.auth.current.getMenus()
		role.menus = menus
		role.auth_time = Date.now()
		role.auth_name = memoryUtils.user.username
		
		//请求更新
		const result = await reqUpdateRole(role)
		if(result.status === 0) {
			
			//如果当前更新的是自己角色的权限，强制退出
			if(role._id === memoryUtils.user.role_id) {
				memoryUtils.user = {}
				storageUtils.removeUser()
				this.props.history.replace('/login')
				message.success('当前角色权限修改了，请重新登录')
			} else {
				message.success('设置角色权限成功')
				
				//更新显示(老方法)
				//this.getRoles()
				
				this.setState({
					roles: [...this.state.roles]
				})
			}
		}
	}
	
	componentWillMount() {
		this.initColumns()
	}
	
	componentDidMount() {
		this.getRoles()
	}
	
    render() {
		
		const {roles, role, isShowAdd, isShowAuth} = this.state
		
		const title = (
		   <span>
		     <Button type="primary" onClick={() => {this.setState({isShowAdd: true})}}>创建角色</Button>
			 <Button style={{marginLeft: 10}} type="primary" disabled={!role._id} onClick={() => {this.setState({isShowAuth: true})}}>设置角色权限</Button>
		   </span>
		)
		
		return (
		   <Card title={title}>
		     <Table
			    bordered
				rowKey='_id'
				dataSource={roles}
				columns={this.columns}
				pagination={{defaultPageSize: PAGE_SIZE}}
				rowSelection={{
					type: 'radio',
					selectedRowKeys: [role._id],
					onSelect: (role) => {
						this.setState({
							role
						})
					}
				}}
				onRow={this.onRow}
			 />
			 
			 <Modal
			    title="添加角色"
				visible={isShowAdd}
				onOk={this.addRole}
				onCancel={() => {this.setState({isShowAdd: false})}}
			 >
			    <AddForm 
					setForm={(form) => this.form = form}
				/> 
			 </Modal>
			 
			 <Modal
			    title="设置角色权限"
					visible={isShowAuth}
					onOk={this.updateRole}
					onCancel={() => {this.setState({isShowAuth: false})}}
			 >
			    <AuthForm
				   role={role}
				   ref={this.auth}
				/> 
			 </Modal>
		   </Card>
		)
	}
 
}
