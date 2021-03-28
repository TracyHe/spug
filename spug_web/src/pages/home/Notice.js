import React, { useEffect, useState } from 'react';
import { Button, Card, List, Modal, Form, Input, Switch, Divider, Tag } from 'antd';
import { DownSquareOutlined, PlusOutlined, UpSquareOutlined, SoundOutlined } from '@ant-design/icons';
import { http } from 'libs';
import styles from "./index.module.less";

function NoticeIndex(props) {
  const id = localStorage.getItem('id');
  const [form] = Form.useForm();
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState();
  const [notice, setNotice] = useState();

  useEffect(() => {
    fetch()
  }, [])

  function fetch() {
    setFetching(true);
    http.get('/api/notice/')
      .then(res => setRecords(res))
      .finally(() => setFetching(false))
  }

  function handleSubmit() {
    setLoading(true);
    const formData = form.getFieldsValue();
    formData['id'] = record.id;
    http.post('/api/notice/', formData)
      .then(() => {
        fetch()
        setRecord(null)
      })
      .finally(() => setLoading(false))
  }

  function showForm(info) {
    setRecord(info);
    setTimeout(() => form.resetFields())
  }

  function handleSort(e, info, sort) {
    e.stopPropagation();
    http.patch('/api/notice/', {id: info.id, sort})
      .then(() => fetch())
  }

  function handleRead() {
    if (!notice.read_ids.includes(id)) {
      const formData = {id: notice.id, read: 1};
      http.patch('/api/notice/', formData)
        .then(() => fetch())
    }
    setNotice(null);
  }

  return (
    <Card
      title="系统公告"
      loading={fetching}
      className={styles.notice}
      extra={<Button type="link" onClick={() => setIsEdit(!isEdit)}>{isEdit ? '完成' : '编辑'}</Button>}>
      {isEdit ? (
        <List>
          <div className={styles.add} onClick={() => showForm({})}><PlusOutlined/>新建公告</div>
          {records.map(item => (
            <List.Item key={item.id} onClick={() => showForm(item)}>
              <div className={styles.item}>
                <UpSquareOutlined onClick={e => handleSort(e, item, 'up')}/>
                <Divider type="vertical"/>
                <DownSquareOutlined onClick={e => handleSort(e, item, 'down')}/>
                <span className={styles.title} style={{marginLeft: 24}}>{item.title}</span>
              </div>
            </List.Item>
          ))}
        </List>
      ) : (
        <List>
          {records.map(item => (
            <List.Item key={item.id} className={styles.item} onClick={() => setNotice(item)}>
              {!item.read_ids.includes(id) && <SoundOutlined style={{color: '#ff4d4f', marginRight: 4}} />}
              <span className={styles.title}>{item.title}</span>
              <span className={styles.date}>{item.created_at.substr(0, 10)}</span>
            </List.Item>
          ))}
          {records.length === 0 && (
            <div style={{marginTop: 12, color: '#999'}}>暂无公告信息</div>
          )}
        </List>
      )}
      <Modal
        title="编辑公告"
        visible={record}
        afterClose={() => console.log('after close')}
        onCancel={() => setRecord(null)}
        confirmLoading={loading}
        onOk={handleSubmit}>
        <Form form={form} initialValues={record} labelCol={{span: 5}} wrapperCol={{span: 18}}>
          <Form.Item name="is_stress" valuePropName="checked" tooltip="自动弹窗强提醒，仅能设置一条公告。" label="弹窗提醒">
            <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
          </Form.Item>
          <Form.Item required name="title" label="公告标题">
            <Input placeholder="请输入"/>
          </Form.Item>
          <Form.Item required name="content" tooltip="" label="公告内容">
            <Input.TextArea placeholder="请输入"/>
          </Form.Item>
        </Form>
      </Modal>
      {notice ? (
        <Modal title={notice.title} visible={notice} footer={null} onCancel={handleRead}>
          {notice.content}
        </Modal>
      ) : null}
    </Card>
  )
}

export default NoticeIndex