//import icons
import icons from 'url:../../img/icons.svg';

export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered(eg. recipe)
   * @param {boolean} [render = true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {Object} View instance
   * @author rougeassassin11
   * @todo Finish implementation
   */

  render(data, render = true) {
    //if there is no data or if the data is an array but length is zero then return error message
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    //insert the markup
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    //create a new DOM object living in the memory
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));

    //select current DOM
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    //compare old DOM to new DOM
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // console.log(curEl, newEl.isEqualNode(curEl));

      //update only on the difference by selecting node with a text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      //Updates changed attributes
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  _clear() {
    //clear container
    this._parentElement.innerHTML = '';
  }

  renderSpinner() {
    const markup = `
    <div class="spinner">
      <svg>
      <use href="${icons}#icon-loader"></use>
      </svg>
    </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `
    <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._message) {
    const markup = `
    <div class="message">
          <div>
            <svg>
              <use href="${icons}#icon-smile"></use>
            </svg>
          </div>
          <p>${message}</p>
        </div>

    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
