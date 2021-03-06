import { expect, fixture } from '@open-wc/testing';

import '../lion-input-email.js';

describe('<lion-input-email>', () => {
  it('has a type = text', async () => {
    const el = await fixture(`<lion-input-email></lion-input-email>`);
    expect(el._inputNode.type).to.equal('text');
  });

  it('has validator "IsEmail" applied by default', async () => {
    // More elaborate tests can be found in lion-validate/test/StringValidators.test.js
    const el = await fixture(`<lion-input-email></lion-input-email>`);
    el.modelValue = 'foo@bar@example.com';
    expect(el.hasFeedbackFor).to.deep.equal(['error']);
    expect(el.validationStates.error.IsEmail).to.be.true;
  });
});
