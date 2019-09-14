import React, {Component} from 'react'
import {
	Card,
	Table,
	Button,
	Icon,
	message,
	Modal
} from 'antd'

import LinkButton from '../../components/link-button'
import {reqCategorys, reqUpdateCategory, reqAddCategory} from '../../api'
import AddForm from './add-form'
import UpdateForm from './update-form'

/*
  商品分类路由
 */
export default class Category extends Component {
  
    state = {
		categorys: [],    //一级分类列表
		subCategorys: [], //二级分类列表
		loading: false,   //是否正在获取数据中
		parentId: '0',    //当前需要显示的分类列表的父分类id
		parentName: '',   //当前需要显示的分类列表的父分类名称
		showStatus: 0,    //标识添加/更新确认框是否显示 0：都不显示， 1：显示添加， 2：显示更新
	}
	
	/*
	   初始化Table列的数组
	*/
    initColumns = () => {
	   this.columns = [
	   	  {
	   	    title: '分类的名称',
	   	    dataIndex: 'name'
	      },
	   	  {
	   	    title: '操作',
	   	    width: 300,
	   	    render: (category) => (
	   	       <span>
	   		     <LinkButton onClick={() => this.showUpdate(category)}>修改分类</LinkButton>
				 {this.state.parentId === '0' ? <LinkButton onClick={() => this.showSubCategorys(category)}>查看子分类</LinkButton> : null}	   			 
	   		   </span>
	   	    )
	   	  }
	   ]
    }
	
	/*
	   异步获取一级分类列表显示
	*/
	getCategorys = async (parentId) => {
		//发请求前，显示loading
		this.setState({
			loading: true
		})
		parentId = parentId || this.state.parentId
		const result = await reqCategorys(parentId)
		//请求完后，隐藏loading
		this.setState({
			loading: false
		})
		
		if(result.status === 0) {
			const categorys = result.data
			//更新状态
			if(parentId === '0') {
				this.setState({
					categorys
				})
			} else {
				this.setState({
					subCategorys: categorys
				})
			}
			
		} else {
			message.error('获取分类列表失败')
		}
	}
	
	/*
	   显示二级分类列表显示
	*/
    showSubCategorys = (category) => {
	   //更新状态
	   this.setState({
		   parentId: category._id,
		   parentName: category.name
	   }, () => {
		   //获取二级分类列表
		   this.getCategorys()
	   })  
    }
   
    /*
      显示一级分类列表显示
    */
    showCategorys = () => {
	   //更新为显示一级列表的状态
	   this.setState({
		   parentId: '0',
		   parentName: '',
		   subCategorys: []
	   })
    }
	
	/*
	  响应点击取消，隐藏确认框
	*/
	handleCancel = () => {
		//清除输入数据
		this.form.resetFields()
		
		this.setState({
			showStatus: 0
		})
	}
	
	/*
	  显示添加的确认框
	*/
	showAdd = () => {
		this.setState({
			showStatus: 1
		})
	}
	
	/*
	   添加分类
	*/
    addCategory = () => {
		
		this.form.validateFields(async (err, values) => {
			if(!err) {
				//1.隐藏确定框
				this.setState({
					   showStatus: 0
				})
				
				//2.搜集数据，并提交添加分类的请求
				const {parentId, categoryName} = values
					  
				//清除输入数据
				this.form.resetFields()
				
				const result = await reqAddCategory(categoryName, parentId)
				
				if(result.status === 0) {
						  //3.重新获取分类列表显示(只需要当前parentId与添加的parentId一致)
						  if(parentId === this.state.parentId) {
							  this.getCategorys()
						  } else if (parentId === '0'){  //在二级分类列表下添加一级分类, 重新获取一级分类列表, 但不需要显示一级列表
					 this.getCategorys('0')
				   }
				}
			}
		})
    }
	
	/*
	  显示更新的确认框
	*/
	showUpdate = (category) => {
		//保存分类对象
		this.category = category
		
		this.setState({
			showStatus: 2
		})
	}
	
	/*
	   更新分类
	*/
	updateCategory = () => {
		
	   //进行表单验证，只有通过了才处理	   
	   this.form.validateFields(async (err, values) => {
		   if(!err) {
			   
			   //1.隐藏确定框
			   this.setState({
				   showStatus: 0
			   })
			   
			   //准备数据
			   const categoryId = this.category._id
			   const {categoryName} = values
			   
			   //清除输入数据
			   this.form.resetFields()
			   
			   //2.发送请求更新分类
			   const result = await reqUpdateCategory({categoryId, categoryName})
			   
			   if(result.status === 0) {
			   		//3.重新显示列表
			   		this.getCategorys()
			   } else {
				   message.error('更新分类失败')
			   }
		   }
	   })
	   
	}
		
	componentWillMount() {
		this.initColumns()
	}
	
	componentDidMount() {
		this.getCategorys()
	}
	
    render() {
		const {categorys, subCategorys, loading, parentId, parentName, showStatus} = this.state
		
		//读取指定的分类
		const category = this.category || {}
		
		const title = parentId === '0' ? '一级分类列表' : (
		   <span>
		     <LinkButton onClick={this.showCategorys}>一级分类列表</LinkButton>
			 <Icon type="arrow-right" style={{marginRight: 5}}/>
			 <span>{parentName}</span>
		   </span>
		)
		const extra = (
		   <Button type="primary" onClick={this.showAdd}>
		      <Icon type="plus" /> 
			  添加
		   </Button>
		)
				
		return (
		   <div className="category">
		     <Card title={title} extra={extra}>
			   <Table
			     bordered
				 rowKey='_id'
				 loading={loading}
			     dataSource={parentId === '0' ? categorys : subCategorys}
				 columns={this.columns}
				 pagination={{
					defaultPageSize: 5,
					showQuickJumper: true
				 }}
			   />
			   
			   <Modal
			     title="添加分类"
			     visible={showStatus===1}
			     onOk={this.addCategory}
			     onCancel={this.handleCancel}
			   >
			     <AddForm
				    categorys={categorys}
					parentId={parentId}
					setForm={(form) => {this.form = form}}
				 />
			   </Modal>
			   
			   <Modal
			     title="更新分类"
			     visible={showStatus===2}
			     onOk={this.updateCategory}
			     onCancel={this.handleCancel}
			   >
			     <UpdateForm
			       categoryName={category.name}
			       setForm={(form) => {this.form = form}}
			     />
			   </Modal>
			 </Card>
		   </div>
		)
	}
 
}
