<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.id" clearable class="filter-item" style="width: 200px;" placeholder="请输入门店ID"/>
      <el-input v-model="listQuery.name" clearable class="filter-item" style="width: 200px;" placeholder="请输入门店名称"/>
      <el-button v-permission="['GET /admin/doorstore/list']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button v-permission="['POST /admin/doorstore/create']" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
    </div>
    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="门店ID" prop="id"/>
      <el-table-column align="center" label="门店名称" prop="doorstoreName"/>
      <el-table-column align="center" label="门店地址" prop="doorstoreAddress"/>
      <el-table-column align="center" property="doorstoreLogo" label="门店图片">
        <template slot-scope="scope">
          <img v-if="scope.row.doorstoreLogo" :src="scope.row.doorstoreLogo" width="80">
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="400px" label="门店介绍" prop="remark"/>
      <el-table-column align="center" label="联系人" prop="linkman"/>
      <el-table-column align="center" label="联系电话" prop="linkmanPhone"/>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['POST /admin/doorstore/update']" type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-permission="['POST /admin/doorstore/delete']" type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="门店名称" prop="doorstoreName">
          <el-input v-model="dataForm.doorstoreName"/>
        </el-form-item>
        <el-form-item label="门店介绍" prop="remark">
          <el-input v-model="dataForm.remark"/>
        </el-form-item>
        <el-form-item label="门店图片" prop="doorstoreLogo">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadPicUrl"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif">
            <img v-if="dataForm.doorstoreLogo" :src="dataForm.doorstoreLogo" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>
        <el-form-item label="门店地址" prop="doorstoreAddress">
          <el-input v-model="dataForm.doorstoreAddress"/>
        </el-form-item>
        <el-form-item label="地址搜索" prop="doorstoreAddressSearch">
          <el-input v-model="doorstoreAddressSearch"/>
          <button style="margin-top: 10px;" type="button" name="searchDoorButton">搜索</button>
        </el-form-item>
        <div id="container">
          1
        </div>
        <el-form-item label="联系人" prop="linkman">
          <el-input v-model="dataForm.linkman"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="linkmanPhone">
          <el-input v-model="dataForm.linkmanPhone"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
#container {
  width: 100%;
  height: 285px;
  margin-bottom: 10px;
}
</style>

<script>
import { listdoorstore, createdoorstore, updatedoorstore, deletedoorstore } from '@/api/doorstore'
import { uploadPath } from '@/api/storage'
import tmap from '@/api/tmap'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Doorstore',
  components: { Pagination },
  data() {
    return {
      map: null,
      doorstoreAddressSearch: null,
      markers: [],
      polyline: [],
      start_marker: [],
      end_marker: [],
      info: [],
      listener: [],
      marker: [],
      uploadPath,
      list: undefined,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        doorstoreName: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        doorstoreName: '',
        remark: '',
        adCode: '',
        linkman: undefined,
        longitude: undefined,
        latitude: undefined,
        linkmanPhone: undefined,
        doorstoreAddress: undefined,
        doorstoreLogo: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        doorstoreName: [
          { required: true, message: '门店名称不能为空', trigger: 'blur' }
        ]
      },
      downloadLoading: false
    }
  },
  computed: {
    headers() {
      return {
        'X-Litemall-Admin-Token': getToken()
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    mapTX() {
      tmap.loadMap('4QVBZ-SVMKX-DV54W-TE4BK-4GMRO-5RF33').then(Tmap => {
        var _this = this
        var myLatlng = new Tmap.LatLng(31.584617993869276, 120.29067993164062)
        var myOptions = {
          zoom: 12,
          center: myLatlng,
          mapTypeId: Tmap.MapTypeId.ROADMAP
        }
        _this.map = new Tmap.Map(document.getElementById('container'), myOptions)
        Tmap.event.addListener(_this.map, 'click', function(event) {
          _this.map.longitude = event.latLng.getLng()
          _this.map.latitude = event.latLng.getLat()
          var geocoder = new Tmap.Geocoder()
          var coord = new Tmap.LatLng(_this.map.latitude, _this.map.longitude)
          _this.marker = new Tmap.Marker({
            // 标记的位置
            position: coord,
            map: _this.map
          })
          _this.markers.push(_this.marker)
          geocoder.getAddress(coord)
          geocoder.setComplete(function(res) {
            _this.map.setCenter(res.detail.location)
            _this.map.address = res.detail.address
            _this.dataForm.doorstoreAddress = _this.map.address
            _this.dataForm.latitude = _this.map.latitude
            _this.dataForm.longitude = _this.map.longitude
          })
        })
        var latlngBounds = new Tmap.LatLngBounds()
        var searchService = new Tmap.SearchService({
          pageIndex: 1,
          pageCapacity: 5,
          autoExtend: true,
          complete: function(results) {
            console.log(results.detail)
            var pois = results.detail.pois
            for (var i = 0, l = pois.length; i < l; i++) {
              var poi = pois[i]
              latlngBounds.extend(poi.latLng)
              var marker = new Tmap.Marker({
                map: _this.map,
                position: poi.latLng
              })
              marker.setTitle(i + 1)
              _this.markers.push(marker)
            }
            _this.map.fitBounds(latlngBounds)
          },
          error: function() {
            console.error('出错了')
          }
        })
        var searchBtn = document.getElementsByName('searchDoorButton')[0]
        Tmap.event.addDomListener(searchBtn, 'click', function() {
          var keyword = _this.doorstoreAddressSearch
          searchService.search(keyword)
        })
      })
    },
    clearOverlays(overlays) {
      var overlay = {}
      while (overlay === overlays.pop()) {
        overlay.setMap(null)
      }
    },
    getList() {
      this.listLoading = true
      listdoorstore(this.listQuery)
        .then(response => {
          this.list = response.data.data.items
          this.total = response.data.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        doorstoreName: '',
        remark: '',
        adCode: '',
        longitude: undefined,
        latitude: undefined,
        linkman: undefined,
        linkmanPhone: undefined,
        doorstoreAddress: 111111,
        doorstoreLogo: undefined
      }
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        this.mapTX()
      })
    },
    uploadPicUrl: function(response) {
      this.dataForm.doorstoreLogo = response.data.url
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createdoorstore(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updatedoorstore(this.dataForm)
            .then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.dataForm)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '更新成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleDelete(row) {
      deletedoorstore(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除成功'
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '门店ID',
          '门店名称',
          '门店介绍',
          '门店图片',
          '门店地址',
          '门店联系人',
          '门店联系地址'
        ]
        const filterVal = ['id', 'doorstoreName', 'remark', 'doorstoreLogo', 'doorstoreAddress', 'linkman', 'linkmanPhone']
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          '门店信息'
        )
        this.downloadLoading = false
      })
    }
  }
}
</script>
