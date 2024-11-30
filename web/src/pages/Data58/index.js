import React from 'react';
import { Segment, Header } from 'semantic-ui-react';
import Data58Table from '../../components/Data58Table';

const Data58 = () => (
  <>
    <Segment>
      <Header as='h3'>58同城房产经纪人</Header>
      <Data58Table />
    </Segment>
  </>
);

export default Data58;
