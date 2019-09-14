import React, {Component} from 'react'
import {
	Card,
	Select,
	Input,
	Button,
	Icon,
	Table,
	message
} from 'antd'

import LinkButton from '../../components/link-button'
import {reqProducts, reqSearchProducts, reqUpdateStatus} from '../../api'
import {PAGE_SIZE} from '../../utils/constants'

const Option = Select.Option

/*
  商品主页路由
 */
export default class ProductHome extends Component {
    
	state = {
		total: 0,          //商品总数量
		products: [],      //商品数组
		loading: false,
		searchName: '',    //搜索的关键字
		searchType: 'productName',    //根据哪个字段搜索
	}
	
	
	initColumns = () => {
		//初始化Table列的数组
		this.columns = [
			{
				title: '商品名称',
				dataIndex: 'name'
			},
			{
				title: '商品描述',
				dataIndex: 'desc'
			},
			{
				title: '价格',
				dataIndex: 'price',
				render: (price) => "￥" + price
			},
			{
				title: '状态',
				width: 100,
				//dataIndex: 'status',
				render: (product) => {
				  const {status, _id} = product
				  return (
				     <span>
				        <Button 
						   type="primary"
						   onClick={() => this.updateStatus(_id, status === 1 ? 2 : 1)}
						>
							{status === 1 ? '下架' : '上架'}
						</Button>
						<span style={{marginLeft: 2, marginTop: 3}}>{status === 1 ? '在售' : '已下架'}</span>
					</span>
				  )
				}
			},
			{
				title: '操作',
				width: 100,
				render: (product) => (
				  <span>
				    <LinkButton onClick={() => this.props.history.push('/product/detail', {product})}>详情</LinkButton>
					<LinkButton onClick={() => this.props.history.push('/product/addupdate', product)}>修改</LinkButton>
				  </span>
				)
			}
		]
	}
	
	/*
	  获取指定页码的列表数据显示
	*/
    getProducts = async (pageNum) => {
		
		//保存pageNum,让其他方法可以看到
		this.pageNum = pageNum
		
		this.setState({
			loading: true
		})
		
		const {searchName, searchType} = this.state
		
		//如果搜索关键字有值，说明我们要做搜索分页
		let result
		if(searchName) {
			result = await reqSearchProducts({pageNum, pageSize: PAGE_SIZE, searchName, searchType})
		} else {
			result = await reqProducts(pageNum, PAGE_SIZE)
		}
				
		this.setState({
			loading: false
		})
		if(result.status === 0) {
			//取出分页数据，更新状态，显示分页列表
			const {total, list} = result.data
			this.setState({
				total,
				products: list
			})
			console.log(this.state.products)
		}
	}
   
    /*
	   更新指定商品的状态
	*/
	updateStatus = async (productId, status) => {
		const result = await reqUpdateStatus(productId, status)
		if(result.status === 0) {
			message.success('更新商品成功')
			this.getProducts(this.pageNum)
		}
	}
	
	componentWillMount() {
		this.initColumns()
	}
	
	componentDidMount() {
		this.getProducts(1)
	}
	
    render() {
		
		const {products, total, loading, searchName, searchType} = this.state
		
		const title = (
		   <span>
		     <Select 
				value={searchType} 
				style={{width: 150}}
				onChange={value => this.setState({searchType:value})}
			>
			   <Option value="productName">按名称搜索</Option>
			   <Option value="productDesc">按描述搜索</Option>
			 </Select>
			 <Input
			    placeholder="关键字" 
			    style={{width: 150, margin: '0 15px'}}
				value={searchName}
				onChange={event => this.setState({searchName:event.target.value})}
			/>
			 <Button type="primary" onClick={() => this.getProducts(1)}>搜索</Button>
		   </span>
		)
		
		const extra = (
		   <Button type="primary" onClick={() => this.props.history.push('/product/addupdate')}>
		     <Icon type="plus" />
			 添加商品
		   </Button>
		)
	
		return (
		   <Card title={title} extra={extra}>
		     <Table 
			    loading={loading}
			    bordered
				rowKey='_id'
			    dataSource={products}
				columns={this.columns}
				pagination={{
					current: this.pageNum,
					total,
					defaultPageSize: PAGE_SIZE,
					showQuickJumper: true,
					onChange: this.getProducts
				}}
			 />
		   </Card>
		)
	}
 
}
