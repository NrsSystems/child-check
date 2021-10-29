var DOMAIN;

if (process.env.NODE_ENV !== 'production') {
  DOMAIN = `${window.location.protocol}//${window.location.hostname}:8000`;
} else {
  DOMAIN = window.location.origin;
}

const formatId = (url, id) => {
  if (id !== null) {
    return `${url}${id}/`;
  } else {
    return url;
  }
};

const addQuery = (url, params) => {
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }
  }
  return url;
};

const urls = {
  addQuery: addQuery,
  child: (id = null, params = null) => {
    var url = new URL(formatId(`${DOMAIN}/api/children/`, id));
    return addQuery(url, params);
  },
  guardian: (id = null, params = null) => {
    var url = new URL(formatId(`${DOMAIN}/api/guardians/`, id));
    return addQuery(url, params);
  },
  check: (id = null, params = null) => {
    var url = new URL(formatId(`${DOMAIN}/api/checks/`, id));
    return addQuery(url, params);
  },
  user: (id = null, params = null) => {
    var url = new URL(formatId(`${DOMAIN}/api/users/`, id));
    return addQuery(url, params);
  },
  scan: (params = null) => {
    var url = new URL(`${DOMAIN}/api/scan/`);
    return addQuery(url, params);
  },
  photo: (path) => {
    if (path) {
      if (path.includes("http")) {
        return path;
      } else {
        return `${DOMAIN}${path}`;
      }
    } else {
      return null;
    }
  },
  report: `${DOMAIN}/api/report/`,
  backup: `${DOMAIN}/api/backup/`,
  login: `${DOMAIN}/api/login/`,
};

export default urls;
