import React from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { useGlobal } from 'reactn';
import { useCookies, withCookies } from 'react-cookie';
import Alert from '@material-ui/lab/Alert';

const SignOut = props => {
  const { history } = props;

  const [cookies, removeCookie] = useCookies(['login']);
  const [global, setGlobal] = useGlobal();

  removeCookie('login');
  setGlobal({ userId: false, name: false, session: false });

  return (
    <Paper
      style={{
        margin: '50px 50px 50px 50px'
      }}>
      <Alert severity="success">
        <h1>Successfully Signed Out</h1>
      </Alert>
    </Paper>
  );
};

SignOut.propTypes = {
  history: PropTypes.object
};

export default withRouter(withCookies(SignOut));
