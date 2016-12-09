export function errorHandler(mesg: string) {
  const code = _getCode(mesg);
  this.throw(code);
}

function _getCode(mesg: string) {
    let code: number;

    switch (mesg) {
      case 'bad request':
        code = 400;
        break;

      case 'unauthorized':
        code = 401;
        break;

      case 'forbidden':
        code = 403;
        break;
        
      default:
        code = 500;
        break;
    }

    return code;
  }