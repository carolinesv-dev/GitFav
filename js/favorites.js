import { GithubUser } from "./GithubUser.js"

// classe para lógica e estrutura de dados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    // JSON.parse -> modifica um json para o objeto q está dentro do json (se array, se objeto...)
    this.entries = JSON.parse(localStorage.getItem
      ('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    // transforma o array entries em string para salvar no localStorage
    // se não salvar quando recarregar não vai ter feito a açaõ q queria
  }

  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error('Usuário já cadastrado!')
      }

      const user = await GithubUser.search(username)

      if (!user.login) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch (error) {
      alert(error.message)
    }

  }

  delete(user) {
    const filteredEntries = this.entries
      .filter(entry =>
        entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')
    this.noFavoritesRow = this.root.querySelector('#no-favorites');
    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    if (this.entries.length === 0) {
      this.noFavoritesRow.style.display = 'table-row';
    } else {
      this.noFavoritesRow.style.display = 'none';

      this.entries.forEach(user => {
        const row = this.createRow(user)

        row.querySelector('.user img').src = `https://github.com/${user.login}.png`
        row.querySelector('.user a').src = `https://github.com/${user.login}`
        row.querySelector('.user p').textContent = user.name
        row.querySelector('.user span').textContent = user.login
        row.querySelector('.repositories').textContent = user.public_repos
        row.querySelector('.followers').textContent = user.followers

        row.querySelector('.remove').onclick = () => {
          const isOk = confirm('Tem certeza que deseja remover esse item?')
          if (isOk) {
            this.delete(user)
          }
        }

        this.tbody.append(row)
      })
    }
  }

  createRow(user) {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/${user.login}.png" alt="User Avatar">
        <a href="https://github.com/${user.login}" target="_blank">
          <p>${user.name}</p>
          <span>${user.login}</span>
        </a>
      </td>
      <td class="repositories">${user.public_repos}</td>
      <td class="followers">${user.followers}</td>
      <td><button class="remove">Remover</button></td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr:not(#no-favorites)').forEach(tr => tr.remove())
  }
}