import { html, LitElement } from '@lion/core';

/**
 * @desc Takes care of accessible rendering of error messages
 * Should be used in conjunction with FormControl having ValidateMixin applied
 */
export class LionValidationFeedback extends LitElement {
  static get properties() {
    return {
      /**
       * @property {FeedbackData} feedbackData
       */
      feedbackData: Array,
    }
  }

  /**
   * @overridable
   */
  // eslint-disable-next-line class-methods-use-this
  _messageTemplate({ message }) {
    return message;
  }

  render() {
    return html`
      ${this.feedbackData && this.feedbackData.map(({ message, type, validator }) => html`
        ${this._messageTemplate({ message, type, validator })}
      `)}
    `;
  }
}