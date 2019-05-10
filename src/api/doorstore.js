import request from '@/utils/request'

export function listdoorstore(query) {
  return request({
    url: '/doorstore/list',
    method: 'get',
    params: query
  })
}

export function createdoorstore(data) {
  return request({
    url: '/doorstore/create',
    method: 'post',
    data
  })
}

export function readdoorstore(data) {
  return request({
    url: '/doorstore/read',
    method: 'get',
    data
  })
}

export function updatedoorstore(data) {
  return request({
    url: '/doorstore/update',
    method: 'post',
    data
  })
}

export function deletedoorstore(data) {
  return request({
    url: '/doorstore/delete',
    method: 'post',
    data
  })
}

export function doorstoreOptions(query) {
  return request({
    url: '/doorstore/options',
    method: 'get',
    params: query
  })
}
