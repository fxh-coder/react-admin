import React, {Component} from 'react'
import {
	Card,
	Form,
	Icon,
	Input,
	Cascader,
	Upload,
	Button,
	message
} from 'antd'

import LinkButton from '../../components/link-button'
import {reqCategorys, reqAddOrUpdateProduct} from '../../api'
import PicturesWall from './pictures-wall'
import RichTextEditor from './rich-text-editor'

const {Item} = Form
const {TextArea} = Input

/*
  商品添加修改路由
 */
class ProductAddUpdate extends Component {
    
	state = {
		options: [],
	}
	
	constructor(props) {
	    super(props)
			
	    //创建用来保存ref标识的标签对象的容器
		this.pw = React.createRef()
		this.editor = React.createRef()
	}
	
	initOptions = async (categorys) => {
		//根据categorys生成options数组
		const options = categorys.map(c => ({
		   value: c._id,
		   label: c.name,
		   isLeaf: false,
		}))
		
		//如果是一个二级分类商品的更新
		const {isUpdate, product} = this
		const {pCategoryId, categoryId} = product
		if(isUpdate && pCategoryId!=='0') {
			//获取对应的二级分类列表
			const subCategorys = await this.getCategorys(pCategoryId)
		    //生成二级下拉列表的options
			const childOptions = subCategorys.map(c => ({
			   value: c._id,
			   label: c.name,
			   isLeaf: true
			}))
			
			//找到当前商品对应的一级option对象
			const targetOption = options.find(option => option.value === pCategoryId)
			//关联到对应的一级option上
			targetOption.children = childOptions
		}
		
		//更新options状态
		this.setState({options})
	}
	
	/*
	   异步获取一级/二级分类列表，并显示
	*/
	getCategorys = async (parentId) => {
		const result = await reqCategorys(parentId)
		if(result.status === 0) {
			const categorys = result.data
			//如果是一级分类列表
			if(parentId === '0') {
			   this.initOptions(categorys)
			} else {
				return categorys
			}
			
		}
	}
	
	/*
	   自定义价格的验证函数
	*/
	validatePrice = (rule, value, callback) => {
		if(value*1 > 0) {
			callback()                //验证通过
		} else {
			callback('价格必须大于0')  //验证没通过
		}	
	}
	
	/*
	   加载下一级列表的回调函数
	*/
   loadData = async selectedOptions => {
	   //得到选择的option对象
	   const targetOption = selectedOptions[0]
	   //显示loading
	   targetOption.loading = true
	   
	   //根据选中的分类，请求获取二级分类列表
	   const subCategorys = await this.getCategorys(targetOption.value)
	   
	   targetOption.loading = false
	   
	   if(subCategorys && subCategorys.length > 0) {
		   //生成一个二级列表的options
		   const childOptions = subCategorys.map(c => ({
		      value: c._id,
		      label: c.name,
		      isLeaf: true
		   }))
		   //关联到当前option上
		   targetOption.children = childOptions
	   } else {
		   targetOption.isLeaf = true
	   }
	   
	   //更新options状态
	   this.setState({
		   options: [...this.state.options],
	   })
   }
	
    submit = () => {
		//进行表单验证，通过后发送请求
		this.props.form.validateFields(async (error, values) => {
			if(!error) {
				//1.搜集所有数据,并封装成product对象
				const {name, desc, price, categoryIds} = values
				let pCategoryId, categoryId
				if(categoryIds.length === 1) {
					pCategoryId = '0'
					categoryId = categoryIds[0]
				} else {
					pCategoryId = categoryIds[0]
					categoryId = categoryIds[1]
				}
				const imgs = this.pw.current.getImgs()
				const detail = this.editor.current.getDetail()
				
				const product = {name, desc, price, imgs, detail, pCategoryId, categoryId}
				
				//如果是更新，需要添加_id
				if(this.isUpdate) {
					product._id = this.product._id
				}
				
				//2.调用接口请求函数(添加/更新)
				const result = await reqAddOrUpdateProduct(product)
				
                //3.根据结果提示
				if(result.status === 0) {
					message.success(`${this.isUpdate ? '更新' : '添加'}商品成功!`)
				    this.props.history.goBack()
				} else {
					message.error(`${this.isUpdate ? '更新' : '添加'}商品失败!`)
				}
			}
		})
	}
	
	componentDidMount() {
		this.getCategorys('0')
	}
	
	componentWillMount() {
		//取出携带的state
		const product = this.props.location.state
		//保存是否是更新的标识(布尔值)
		this.isUpdate = !!product
		//保存product，(如果没有，就是{})
		this.product = product || {}
	}
	
    render() {
		
		const {isUpdate, product} = this
		const {pCategoryId, categoryId, imgs, detail} = product
		//用来接收级联分类Id的数组
		const categoryIds = []
		if(isUpdate) {
			if(pCategoryId === '0') {
				//商品是一级分类的商品
				categoryIds.push(pCategoryId)
			} else {
				//商品是二级分类的商品
				categoryIds.push(pCategoryId)
				categoryIds.push(categoryId)
			}
		}
		
		const formItemLayout = {
			labelCol: {span: 2},
			wrapperCol: {span: 8}
		}
		
		const title = (
		   <span>
		     <LinkButton onClick={() => {this.props.history.goBack()}}>
			    <Icon type="arrow-left" style={{fontSize: 20}} />
			 </LinkButton>
			 <span>{isUpdate ? '修改商品' : '添加商品'}</span>
		   </span>
		)
		
		const {getFieldDecorator} = this.props.form
		
		return (
		   <Card title={title}>
		     <Form {...formItemLayout}>
			   <Item label="商品名称">
			      {
			        getFieldDecorator('name', {
			          initialValue: product.name,
			          rules: [
			            {required: true, message: '必须输入商品名称'}
			          ]
			        })(<Input placeholder='请输入商品名称'/>)
			      }
			   </Item>
			   <Item label="商品描述">
			      {
					 getFieldDecorator('desc', {
							initialValue: product.desc,
							rules: [
								{required: true, message: '必须输入商品描述'}
							]
					 })(<TextArea placeholder="请输入商品描述" autosize={{minRows: 2}} />)
			      }
			   </Item>
			   <Item label="商品价格">
			      {
					 getFieldDecorator('price', {
							initialValue: product.price,
							rules: [
								{required: true, message: '必须输入商品价格'},
								{validator: this.validatePrice}
							]
					 })(<Input type="number" placeholder="请输入商品价格" addonAfter="元" />)
			      }
			     
			   </Item>
			   <Item label="商品分类">
			      {
			        getFieldDecorator('categoryIds', {
			          initialValue: categoryIds,
			          rules: [
			            {required: true, message: '必须指定商品分类'}
			          ]
			        })(<Cascader
					    placeholder="请指定商品分类"
						options={this.state.options}
						loadData={this.loadData}
					 />)
			      }
			   </Item>
			   <Item label="商品图片">
			     <PicturesWall ref={this.pw} imgs={imgs} />
			   </Item>
			   <Item label="商品详情" labelCol={{span: 2}} wrapperCol={{span: 16}}>
			     <RichTextEditor ref={this.editor} detail={detail} />
			   </Item>
			   <Item>
			     <Button type="primary" onClick={this.submit}>提交</Button>
			   </Item>
			 </Form>
		   </Card>
		)
	}
 
}

export default Form.create()(ProductAddUpdate)
