/**
 * These are vanilla JS DOM tests for the script.js DOB front-end logic.
 * jsdom is required as test environment.
 */
const fs = require('fs');
const path = require('path');

const { JSDOM } = require('jsdom');

const scriptCode = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf-8');

function setupDOM() {
  const dom = new JSDOM(`<!DOCTYPE html><body>
  <form id="dob-form">
    <input id="yourDate" />
    <input id="herDate" />
    <button type="submit"></button>
  </form>
  <div id="secret-content" class="hidden"></div>
  </body>`, { runScripts: "dangerously", resources: "usable" });
  dom.window.alert = jest.fn();
  dom.window.fetch = jest.fn();
  dom.window.document.getElementById('secret-content').classList = { remove: jest.fn(), add: jest.fn() };
  // Attach the script.js code
  dom.runVMScript(new dom.vm.Script(scriptCode));
  return dom;
}

describe('script.js DOB validation - client', () => {
  let dom, window, document;
  beforeEach(() => {
    dom = setupDOM();
    window = dom.window;
    document = window.document;
  });

  it('accepts valid dates, does not alert, calls fetch', async () => {
    document.getElementById('herDate').value = '1999-08-03';
    document.getElementById('yourDate').value = '1999-04-28';
    window.fetch.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });
    const form = document.getElementById('dob-form');
    const e = { preventDefault: jest.fn() };
    await form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    expect(window.alert).not.toHaveBeenCalled();
    expect(window.fetch).toHaveBeenCalled();
    expect(document.getElementById('secret-content').classList.remove).toHaveBeenCalledWith('hidden');
  });

  it('alerts on bad format', async () => {
    document.getElementById('herDate').value = '1999-08-03';
    document.getElementById('yourDate').value = '04/28/1999'; // Bad format
    const form = document.getElementById('dob-form');
    await form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/YYYY-MM-DD/));
    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('alerts if calendar date is impossible', async () => {
    document.getElementById('herDate').value = '1999-02-31'; // No Feb 31
    document.getElementById('yourDate').value = '1999-04-28';
    const form = document.getElementById('dob-form');
    await form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Invalid date/));
    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('alerts if too old (before 1900)', async () => {
    document.getElementById('herDate').value = '1899-01-01';
    document.getElementById('yourDate').value = '1999-04-28';
    const form = document.getElementById('dob-form');
    await form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/between 1900-01-01/));
    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('alerts if field is empty', async () => {
    document.getElementById('herDate').value = '';
    document.getElementById('yourDate').value = '1999-04-28';
    const form = document.getElementById('dob-form');
    await form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    expect(window.alert).toHaveBeenCalled();
    expect(window.alert.mock.calls[0][0]).toMatch(/format/);
    expect(window.fetch).not.toHaveBeenCalled();
  });
});
