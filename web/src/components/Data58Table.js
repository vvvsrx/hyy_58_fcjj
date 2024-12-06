import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  FormButton,
  FormGroup,
  FormInput,
  FormSelect,
  Label,
  Pagination,
  Popup,
  Select,
  Table,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { API, showError, showSuccess } from '../helpers';

import { ITEMS_PER_PAGE } from '../constants';
import QrCodePopupButton from './QrCodePopupButton';


const Data58Table = () => {
  const hasLoadedCities = useRef(false);
  const [data58, setData58] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [dayType, setdayType] = useState(0);
  const [cityOptions, setCityOptions] = useState([]);
  const [cityType, setCityType] = useState('');
  const [statusType, setStatusType] = useState(-1);
  const [inputs, setInputs] = useState({
    name: '',
  });
  const { name } = inputs;

  const DAYTYPE_OPTIONS = [
    { key: '0', text: '全部', value: 0 },
    { key: '1', text: '今天', value: 1 },
    { key: '2', text: '昨天', value: 2 },
  ];

  const CITYTYPE_OPTIONS = [
    { key: '', value: '', text: '全部' },
    ...cityOptions.map(city => ({ key: city, value: city, text: city })),
  ];

  const STATUS_OPTIONS = [
    { key: '-1', text: '全部', value: -1 },
    { key: '0', text: '失效', value: 0 },
    { key: '1', text: '正常', value: 1 },
  ];

  const loadUsers = async (startIdx) => {
    const res = await API.get(`/api/58data/?p=${startIdx}&city=${cityType}&dayType=${dayType}&name=${name}&status=${statusType}`);
    const { success, message, data } = res.data;
    if (success) {
      if (startIdx === 0) {
        setData58(data);
      } else {
        let newUsers = data58;
        newUsers.push(...data);
        setData58(newUsers);
      }
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const loadCities = async (startIdx) => {
    const res = await API.get(`/api/58data/cities`);
    const { success, message, data } = res.data;
    if (success) {
      setCityOptions(data);
    } else {
      showError(message);
    }
  };

  const onPaginationChange = (e, { activePage }) => {
    (async () => {
      if (activePage === Math.ceil(data58.length / ITEMS_PER_PAGE) + 1) {
        // In this case we have to load more data and then append them.
        await loadUsers(activePage - 1);
      }
      setActivePage(activePage);
    })();
  };

  const refresh = async () => {
    setLoading(true);
    setActivePage(1);
    await loadUsers(0);
  };

  useEffect(() => {
    if (!hasLoadedCities.current) {
      loadCities()
        .then()
        .catch((reason) => {
          showError(reason);
        });
      hasLoadedCities.current = true;
    }
    loadUsers(0)
      .then()
      .catch((reason) => {
        showError(reason);
      });
  }, [cityType,dayType,statusType]);


  const renderStatus = (status) => {
    switch (status) {
      case 0:
        return <Label color='red' basic>经纪人未开启店铺</Label>;
      case 1:
        return (
          <Label basic>
            正常
          </Label>
        );
      default:
        return (
          <Label basic color='grey'>
            未知状态
          </Label>
        );
    }
  };

  const renderTime = (updatetime) => {
    const updateTime = new Date(updatetime);
    const currentTime = new Date();
    
    // 获取今天和昨天的日期
    const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // 判断更新时间
    if (updateTime >= today && updateTime < today.setDate(today.getDate() + 1)) {
        return <p className="ui red">今天最新</p>;
    } else if (updateTime >= yesterday && updateTime < today) {
      return <p className="ui orange">昨天</p>;
    } else {
        return updatetime; // 返回原始时间数据
    }
};


const handleInputChange = (e, { name, value }) => {
  setInputs((inputs) => ({ ...inputs, [name]: value }));
};


  const sortUser = (key) => {
    if (data58.length === 0) return;
    setLoading(true);
    let sortedUsers = [...data58];
    sortedUsers.sort((a, b) => {
      return ('' + a[key]).localeCompare(b[key]);
    });
    if (sortedUsers[0].id === data58[0].id) {
      sortedUsers.reverse();
    }
    setData58(sortedUsers);
    setLoading(false);
  };

  return (
    <>
      <Form>
          <FormGroup widths='equal'>
            <FormInput fluid label='姓名' value={name} name='name' onChange={handleInputChange} />
            <FormSelect
                  fluid
                  label='时间'
                  placeholder='选择明细时间'
                  options={DAYTYPE_OPTIONS}
                  name='dayType'
                  value={dayType}
                  onChange={(e, { name, value }) => {
                    setdayType(value);
                  }}/>
            <FormSelect
                  fluid
                  label='城市'
                  placeholder='全部'
                  options={CITYTYPE_OPTIONS}
                  name='cityType'
                  value={cityType}
                  onChange={(e, { name, value }) => {
                    setCityType(value);
                  }}
                />
            <FormSelect
                  fluid
                  label='状态'
                  placeholder='状态'
                  options={STATUS_OPTIONS}
                  name='statusType'
                  value={statusType}
                  onChange={(e, { name, value }) => {
                    setStatusType(value);
                  }}
                />
            <FormButton fluid label='操作' onClick={refresh}>查询</FormButton>
          </FormGroup>
      </Form>

      <Table basic>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
              }}
            >
              照片
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortUser('name');
              }}
            >
              姓名
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortUser('score');
              }}
            >
              评分
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortUser('city');
              }}
            >
              城市
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer', width: '300px' }}
              onClick={() => {
              }}
            >
              信息
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortUser('status');
              }}
            >
              状态
            </Table.HeaderCell>
            <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortUser('updatetime');
              }}
            >
              更新时间
            </Table.HeaderCell>
            <Table.HeaderCell>操作</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data58
            .slice(
              (activePage - 1) * ITEMS_PER_PAGE,
              activePage * ITEMS_PER_PAGE
            )
            .map((user, idx) => {
              if (user.deleted) return <></>;
              return (
                <Table.Row key={user.id}>
                  <Table.Cell><img src={user.img} width={40} /></Table.Cell>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.score}</Table.Cell>
                  <Table.Cell>{user.city}</Table.Cell>
                  <Table.Cell>
                  {user.parameter.map((text, idx) => { return text + "|" })}
                  </Table.Cell>
                  <Table.Cell>{renderStatus(user.status)}</Table.Cell>
                  <Table.Cell>{renderTime(user.updatetime)}</Table.Cell>
                  <Table.Cell>
                    {/* <QrCodePopupButton uid={user.uid} /> */}
                    <a href={user.olink} target='_blank' className="ui green icon button" >
                      <i className="phone icon"></i>
                    </a>
                  </Table.Cell>
                </Table.Row>
              );
            })}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='6'>
              {/* <Button size='small' as={Link} to='/user/add' loading={loading}>
                添加新的用户
              </Button> */}
              <Pagination
                floated='right'
                activePage={activePage}
                onPageChange={onPaginationChange}
                size='small'
                siblingRange={1}
                totalPages={
                  Math.ceil(data58.length / ITEMS_PER_PAGE) +
                  (data58.length % ITEMS_PER_PAGE === 0 ? 1 : 0)
                }
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  );
};

export default Data58Table;
