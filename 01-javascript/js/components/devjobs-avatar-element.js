class DevJobsAvatar extends HTMLElement {
  constructor() {
    super(); // llamar al constructor de HTMLElement

    this.attachShadow({ mode: 'open' })
  }

  createUrl(service, username) {
    return `https://unavatar.io/${service}/${username}`
  }

  render() {
    const service = this.getAttribute('service') ?? 'github'
    const username = this.getAttribute('username') ?? 'midudev'
    const size = this.getAttribute('size') ?? '36'

    const url = this.createUrl(service, username)

    this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }
    
      img {
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        display: block;
      }
    </style>

      <img 
        src="${url}" 
        alt="Avatar de ${username}" 
        class="avatar"
      />
    `
  }

  connectedCallback() {
    this.render()
  }
}

customElements.define('devjobs-avatar', DevJobsAvatar)