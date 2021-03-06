'use babel'

import { Point } from 'atom'
import imports from './imports'
import getSize from './size'

export default {
  subscriptions: null,
  decorations: [],

  activate() {
    console.log('import cost activated')
    this.attachLabels()

    atom.workspace.onDidChangeActivePaneItem(() => this.attachLabels())

    atom.workspace.observeTextEditors(editor =>
      editor.onDidSave(() => this.attachLabels())
    )
  },

  removeLabels() {
    this.decorations.map(d => d.destroy())
    this.decorations = []
  },

  attachLabels() {
    this.removeLabels()
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) return

    const code = editor.getText()

    const dependencies = imports(code)

    dependencies.map(d => {
      const name = d.value

      const line = d.loc.start.line - 1 // starts at 0 in atom
      const length = editor.lineLengthForScreenRow(line)

      const label = document.createElement('span')
      label.className = 'atom-import-cost-label'
      label.textContent = '...'

      const position = new Point(line, length)

      const marker = editor.markScreenPosition(position)
      const decoration = editor.decorateMarker(marker, {
        type: 'overlay',
        item: label
      })

      getSize(name).then(size => {
        if (size === 'invalid') label.textContent = ''
        else if (size) label.textContent = size
        else label.textContent = '¯\\_(ツ)_/¯ could not fetch size, API is down!'

        decoration.setProperties({ item: label })
      })

      this.decorations.push(decoration)
    })
  },

  deactivate() {
    this.subscriptions.dispose()
  }
}
