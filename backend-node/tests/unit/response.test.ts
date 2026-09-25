import { ResponseUtil } from '../../src/utils/response.util';

describe('Response Utility Test Suite', () => {
  it('should format success responses correctly', () => {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    ResponseUtil.success(res, { foo: 'bar' }, 'Success message', 200);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success message',
      data: { foo: 'bar' },
    });
  });

  it('should format error responses correctly', () => {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    ResponseUtil.error(res, 'Error message', 400);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Error message',
    });
  });
});
