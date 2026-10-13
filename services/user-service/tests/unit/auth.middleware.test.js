const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const config = require('../../src/config/env.config');
const { authenticateToken, authorizeRole } = require('../../src/middlewares/auth.middleware');
const { UnauthorizedError, ForbiddenError } = require('../../src/utils/errors.util');

test('authenticateToken - throws UnauthorizedError when header or token is missing', () => {
  const req = { headers: {} };
  const res = {};
  let nextCalledWith = null;

  authenticateToken(req, res, (err) => {
    nextCalledWith = err;
  });

  assert.equal(nextCalledWith instanceof UnauthorizedError, true);
});

test('authenticateToken - successfully verifies token and populates req.user', () => {
  const payload = { id: 'uuid-1234', email: 'test@example.com', role: 'JOB_SEEKER' };
  const token = jwt.sign(payload, config.JWT.ACCESS_SECRET);

  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  const res = {};
  let nextCalledWith = null;

  authenticateToken(req, res, (err) => {
    nextCalledWith = err;
  });

  assert.equal(nextCalledWith, undefined);
  assert.equal(req.user.userId, 'uuid-1234');
  assert.equal(req.user.id, 'uuid-1234');
  assert.equal(req.user.email, 'test@example.com');
  assert.equal(req.user.role, 'JOB_SEEKER');
});

test('authorizeRole - allows matching role and forbids unmatching role', () => {
  const req = { user: { role: 'JOB_SEEKER' } };
  const res = {};

  let allowed = false;
  authorizeRole('JOB_SEEKER')(req, res, () => {
    allowed = true;
  });
  assert.equal(allowed, true);

  let forbiddenError = null;
  authorizeRole('RECRUITER')(req, res, (err) => {
    forbiddenError = err;
  });
  assert.equal(forbiddenError instanceof ForbiddenError, true);
});

