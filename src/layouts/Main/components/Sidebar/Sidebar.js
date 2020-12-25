import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Divider, Drawer } from '@material-ui/core';
import DashboardIcon from '@material-ui/icons/Dashboard';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import EventIcon from '@material-ui/icons/Event';
import SearchIcon from '@material-ui/icons/Search';
import BuildIcon from '@material-ui/icons/Build';
import { Profile, SidebarNav } from './components';
import { useGlobal } from 'reactn';
import { useCookies } from 'react-cookie';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

const useStyles = makeStyles(theme => ({
  drawer: {
    width: 240,
    [theme.breakpoints.up('lg')]: {
      marginTop: 64,
      height: 'calc(100% - 64px)'
    }
  },
  root: {
    backgroundColor: theme.palette.white,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(2, 0)
  },
  nav: {
    marginBottom: theme.spacing(2)
  }
}));

const Sidebar = props => {
  const [global, setGlobal] = useGlobal();
  const [cookies] = useCookies(['login']);
  var inlog = false;
  if (!global.userId && typeof cookies.login === 'object') {
    setGlobal(cookies.login);
    inlog = true;
  }
  const { open, variant, onClose, className, ...rest } = props;

  const classes = useStyles();

  const pages = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon />
    },
    {
      title: 'Calendar',
      href: '/calendar',
      icon: <EventIcon />
    },
    {
      title: 'Search Members',
      href: '/search',
      icon: <SearchIcon />
    },
    {
      title: 'Admin Tools',
      href: '/admin',
      icon: <BuildIcon />
    },
    inlog || global.userId
      ? {
          title: 'Sign Out',
          href: '/sign-out',
          icon: <ExitToAppIcon />
        }
      : {
          title: 'Sign In',
          href: '/sign-in',
          icon: <LockOpenIcon />
        }
  ];

  return (
    <Drawer
      anchor="left"
      classes={{ paper: classes.drawer }}
      onClose={onClose}
      open={open}
      variant={variant}>
      <div {...rest} className={clsx(classes.root, className)}>
        <Profile />
        <Divider className={classes.divider} />
        <SidebarNav className={classes.nav} pages={pages} />
      </div>
    </Drawer>
  );
};

Sidebar.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  variant: PropTypes.string.isRequired
};

export default Sidebar;
