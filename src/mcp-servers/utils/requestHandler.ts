const resCache = new Map();
let count = 0;

export const handleRes = (req, res, transport) => {
  const previousCount = count;
  count++;
  const currntCount = count;
  let resolve: ((val?: unknown) => void) | null = null;
  resCache.set(currntCount, new Promise((res) => (resolve = res)));

  const cleandUp = () => {
    // console.log('Cleaning up response:');
    resolve?.();
    resCache.delete(currntCount);
  };

  //   const wrappedRes = wrapResponse(res, function () {
  //     // console.log('Response closed - custom handler');
  //     console.log(
  //       'Response closed:',
  //       'status code :' + res.statusCode,
  //       ' request count:',
  //       count,
  //     );
  //     cleandUp();
  //   });

  //   res.on('finish', () => {
  //     console.log(
  //       'Response finished:',
  //       'status code :' + res.statusCode,
  //       ' request count:',
  //       count,
  //     );
  //     // console.log(transport._streamMapping.get(transport._standaloneSseStreamId));
  //     cleandUp();
  //   });
  //   res.on('close', () => {
  //     console.log(
  //       'Response closed:',
  //       'status code :' + res.statusCode,
  //       ' request count:',
  //       count,
  //     );
  //     cleandUp();
  //   });
  res.on('error', () => {
    cleandUp();
  });

  if (resCache.get(previousCount) && req.method === 'GET') {
    resCache.get(previousCount).then(() => {
      console.log(
        '********* request start, previousCount:',
        previousCount,
        'currentCount:',
        currntCount,
      );

      transport.handleRequest(req, res, req.body);
    });
  } else {
    console.log(
      req.method,
      req.path,
      '  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
    );
    console.log(
      '********* request start, previousCount:',
      previousCount,
      'currentCount:',
      currntCount,
    );
    transport.handleRequest(req, res, req.body);
  }
};

export const raiseJSONRpcBadRequestError = (res, message?: string) => {
  res.status(400).json({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: message ?? 'Bad Request: No valid session ID provided',
    },
    id: null,
  });
};
