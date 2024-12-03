import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Label,
  Pagination,
  Popup,
  Table,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { API, showError, showSuccess } from '../helpers';

import { ITEMS_PER_PAGE } from '../constants';
import QrCodePopupButton from './QrCodePopupButton';


const Data58Table = () => {
  const [data58, setData58] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);

  const loadUsers = async (startIdx) => {
    const res = await API.get(`/api/58data/?p=${startIdx}`);
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

  const onPaginationChange = (e, { activePage }) => {
    (async () => {
      if (activePage === Math.ceil(data58.length / ITEMS_PER_PAGE) + 1) {
        // In this case we have to load more data and then append them.
        await loadUsers(activePage - 1);
      }
      setActivePage(activePage);
    })();
  };

  useEffect(() => {
    loadUsers(0)
      .then()
      .catch((reason) => {
        showError(reason);
      });
  }, []);


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

  const searchUsers = async () => {
    if (searchKeyword === '') {
      // if keyword is blank, load files instead.
      await loadUsers(0);
      setActivePage(1);
      return;
    }
    setSearching(true);
    const res = await API.get(`/api/58data/search?keyword=${searchKeyword}`);
    const { success, message, data } = res.data;
    if (success) {
      setData58(data);
      setActivePage(1);
    } else {
      showError(message);
    }
    setSearching(false);
  };

  const handleKeywordChange = async (e, { value }) => {
    setSearchKeyword(value.trim());
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
      {/* <Form onSubmit={searchUsers}>
        <Form.Input
          icon='search'
          fluid
          iconPosition='left'
          placeholder='搜索经纪人'
          value={searchKeyword}
          loading={searching}
          onChange={handleKeywordChange}
        />
      </Form> */}

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
            {/* <Table.HeaderCell
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sortUser('updatetime');
              }}
            >
              更新时间
            </Table.HeaderCell> */}
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
                  {/* <Table.Cell>{user.updatetime}</Table.Cell> */}
                  <Table.Cell>
                    <QrCodePopupButton uid={user.uid} />
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
