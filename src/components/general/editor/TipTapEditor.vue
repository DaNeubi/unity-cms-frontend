<template>
  <div class="row tt-editor-header items-center">
    <q-icon name="mdi-format-paragraph"
            class="cursor-pointer"
            color="black"
            @click="setParagraph(editor)"
            size="md">
      <q-tooltip :delay="500">
        Paragraph
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-italic"
            class="cursor-pointer"
            color="black"
            @click="toggleItalic(editor)"
            size="md">
      <q-tooltip :delay="500">
        Kursiv
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-bold"
            class="cursor-pointer"
            color="black"
            @click="toggleBold(editor)"
            size="md">
      <q-tooltip :delay="500">
        Fett
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-underline"
            class="cursor-pointer"
            color="black"
            @click="toggleUnderline(editor)"
            size="md">
      <q-tooltip :delay="500">
        Unterstrichen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-strikethrough"
            class="cursor-pointer"
            color="black"
            @click="toggleStrike(editor)"
            size="md">
      <q-tooltip :delay="500">
        Durchgestrichen
      </q-tooltip>
    </q-icon>
    <q-separator vertical
                 class="q-mx-sm"/>
    <q-icon name="mdi-palette"
            class="cursor-pointer"
            :style="`color: ${selectedTextColor};`"
            size="md">
      <q-popup-edit :model-value="selectedTextColor"
                    v-slot="scope"
                    buttons
                    label-set="Aktualisieren"
                    label-cancel="Abbrechen"
                    @save="(val) => selectedTextColor = val">
        <q-color v-model="scope.value"
                 class="q-px-sm q-py-md"
                 default-view="spectrum"
                 no-footer
                 format-model="hex"
                 @input="selectedTextColor = scope.modelValue"/>
      </q-popup-edit>
      <q-tooltip :delay="500">
        Farbe für Text
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-text-variant"
            class="cursor-pointer"
            color="black"
            @click="setTextColor(editor)"
            size="md">
      <q-tooltip :delay="500">
        Text Färben
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-texture-box"
            class="cursor-pointer"
            color="black"
            @click="unsetTextColor(editor)"
            size="md">
      <q-tooltip :delay="500">
        Textfarbe zurücksetzen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-palette"
            class="cursor-pointer"
            :style="`color: ${selectedHighlightColor};`"
            size="md">
      <q-popup-edit :model-value="selectedHighlightColor"
                    v-slot="scope"
                    buttons
                    label-set="Aktualisieren"
                    label-cancel="Abbrechen"
                    @save="(val) => selectedHighlightColor = val">
        <q-color v-model="scope.value"
                 class="q-px-sm q-py-md"
                 default-view="spectrum"
                 no-footer
                 format-model="hex"
                 @input="selectedHighlightColor = scope.modelValue"/>
      </q-popup-edit>
      <q-tooltip :delay="500">
        Farbe für Highlighter
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-color-highlight"
            class="cursor-pointer"
            color="black"
            @click="toggleHighlight(editor)"
            size="md">
      <q-tooltip :delay="500">
        Text Highlighten
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-texture-box"
            class="cursor-pointer"
            color="black"
            @click="unsetHighlight(editor)"
            size="md">
      <q-tooltip :delay="500">
        Highlighterfarbe zurücksetzen
      </q-tooltip>
    </q-icon>
    <q-separator vertical
                 class="q-mx-sm"/>
    <q-icon name="mdi-format-align-left"
            class="cursor-pointer"
            color="black"
            @click="alignLeft(editor)"
            size="md">
      <q-tooltip :delay="500">
        Linksbündig ausrichten
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-align-center"
            class="cursor-pointer"
            color="black"
            @click="alignCenter(editor)"
            size="md">
      <q-tooltip :delay="500">
        Zentriert ausrichten
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-align-right"
            class="cursor-pointer"
            color="black"
            @click="alignRight(editor)"
            size="md">
      <q-tooltip :delay="500">
        Rechtsbündig ausrichten
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-align-justify"
            class="cursor-pointer"
            color="black"
            @click="alignJustify(editor)"
            size="md">
      <q-tooltip :delay="500">
        Blocksatz
      </q-tooltip>
    </q-icon>
    <q-separator vertical
                 class="q-mx-sm"/>
    <q-icon name="mdi-format-subscript"
            class="cursor-pointer"
            color="black"
            @click="toggleSubScript(editor)"
            size="md">
      <q-tooltip :delay="500">
        Heruntergestellt
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-superscript"
            class="cursor-pointer"
            color="black"
            @click="toggleSuperScript(editor)"
            size="md">
      <q-tooltip :delay="500">
        Hochgestellt
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-link-variant"
            class="cursor-pointer"
            color="black"
            @click="toggleLink(editor)"
            size="md">
      <q-tooltip :delay="500">
        Link hinzufügen/entfernen
      </q-tooltip>
    </q-icon>
    <q-separator vertical
                 class="q-mx-sm"/>
    <q-select outlined
              v-model="selectedFontSize"
              :options="fontSizes"
              :option-value="(val) => val.size"
              :option-label="(val) => val.label"
              dense>
      <template v-slot:prepend>
        <q-icon name="mdi-format-letter-case"
                color="black">
        </q-icon>
      </template>
      <q-tooltip :delay="500">
        Schriftgröße
      </q-tooltip>
    </q-select>
    <q-separator vertical
                 class="q-mx-sm"/>
    <q-select outlined
              dense
              v-model="selectedFontFamily"
              :options="fontFamilies">
      <template v-slot:prepend>
        <q-icon name="mdi-format-font"
                color="black">
        </q-icon>
      </template>
      <q-tooltip :delay="500">
        Schriftart
      </q-tooltip>
    </q-select>
    <q-separator vertical
                 class="q-mx-sm"/>
    <q-icon name="mdi-format-list-bulleted"
            class="cursor-pointer"
            color="black"
            @click="toggleBulletList(editor)"
            size="md">
      <q-tooltip :delay="500">
        Liste erstellen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-format-list-group-plus"
            class="cursor-pointer"
            color="black"
            @click="splitListItem(editor)"
            size="md">
      <q-tooltip :delay="500">
        Listen-Element teilen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-playlist-play"
            class="cursor-pointer"
            color="black"
            @click="sinkListItem(editor)"
            size="md">
      <q-tooltip :delay="500">
        Listen-Element Einrücken
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-playlist-minus"
            class="cursor-pointer"
            color="black"
            @click="liftListItem(editor)"
            size="md">
      <q-tooltip :delay="500">
        Listen-Element Asrücken
      </q-tooltip>
    </q-icon>
    <q-separator vertical
                 class="q-mx-sm"/>
    <q-icon name="mdi-format-quote-close"
            class="cursor-pointer"
            color="black"
            @click="toggleBlockquote(editor)"
            size="md">
      <q-tooltip :delay="500">
        Zitat
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-minus"
            class="cursor-pointer"
            color="black"
            @click="setHorizontalLine(editor)"
            size="md">
      <q-tooltip :delay="500">
        Horizontale Linie
      </q-tooltip>
    </q-icon>
    <q-separator vertical
                 class="q-mx-sm"/>
    <q-icon name="mdi-table"
            class="cursor-pointer"
            color="black"
            @click="addDefaultTable(editor)"
            size="md">
      <q-tooltip :delay="500">
        Tabelle mit 3x3 erstellen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-table-remove"
            class="cursor-pointer"
            color="black"
            @click="deleteTable(editor)"
            size="md">
      <q-tooltip :delay="500">
        Tabelle löschen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-table-column-plus-before"
            class="cursor-pointer"
            color="black"
            @click="addColumnBefore(editor)"
            size="md">
      <q-tooltip :delay="500">
        Spalte vor der aktuellen einfügen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-table-column-plus-after"
            class="cursor-pointer"
            color="black"
            @click="addColumnAfter(editor)"
            size="md">
      <q-tooltip :delay="500">
        Spalte nach der aktuellen einfügen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-table-column-remove"
            class="cursor-pointer"
            color="black"
            @click="deleteColumn(editor)"
            size="md">
      <q-tooltip :delay="500">
        Spalte löschen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-table-row-plus-after"
            class="cursor-pointer"
            color="black"
            @click="addRowAfter(editor)"
            size="md">
      <q-tooltip :delay="500">
        Zeile nach der aktuellen einfügen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-table-row-plus-before"
            class="cursor-pointer"
            color="black"
            @click="addRowBefore(editor)"
            size="md">
      <q-tooltip :delay="500">
        Zeile vor der aktuellen einfügen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-table-row-remove"
            class="cursor-pointer"
            color="black"
            @click="deleteRow(editor)"
            size="md">
      <q-tooltip :delay="500">
        Zeile löschen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-table-split-cell"
            class="cursor-pointer"
            color="black"
            @click="splitCell(editor)"
            size="md">
      <q-tooltip :delay="500">
        Zelle teilen
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-table-merge-cells"
            class="cursor-pointer"
            color="black"
            @click="mergeCells(editor)"
            size="md">
      <q-tooltip :delay="500">
        Zellen zusammenführen
      </q-tooltip>
    </q-icon>
    <q-separator vertical
                 class="q-mx-sm"/>
    <q-icon name="mdi-undo"
            class="cursor-pointer"
            color="black"
            @click="undo(editor)"
            size="md">
      <q-tooltip :delay="500">
        Rückgängig
      </q-tooltip>
    </q-icon>
    <q-icon name="mdi-redo"
            class="cursor-pointer"
            color="black"
            @click="redo(editor)"
            size="md">
      <q-tooltip :delay="500">
        Wiederholen
      </q-tooltip>
    </q-icon>
  </div>
  <editor-content :editor="editor"
                  class="tt-editor-outer q-mt-sm"/>
  <div class="q-mt-md">
    <div v-if="editor"
         :class="(editor.storage.characterCount.characters() * 0.8) > 104858 ? 'tt-editor-counter-limit' : (editor.storage.characterCount.characters() * 0.6) > 78643 ? 'tt-editor-counter-close' : 'tt-editor-counter-default'">
      {{ editor.storage.characterCount.characters() }} / 100.000 Zeichen
    </div>
  </div>
</template>

<script lang="ts">
import { Editor, EditorContent, useEditor } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'
import { ref, watch, defineComponent, computed, onMounted } from 'vue'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Link } from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import { FontFamily } from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import { Table } from '@tiptap/extension-table'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableRow } from '@tiptap/extension-table-row'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extension-placeholder'

export default defineComponent({
  name: 'TipTapEditor',
  components: { EditorContent },
  emits: [
    'updateContent'
  ],
  props: {
    initialContent: {
      type: String,
      default: '',
      required: false
    }
  },
  setup (props, { emit }) {
    const editor = (useEditor({
      content: '',
      extensions: [
        TextStyle.configure({
          HTMLAttributes: {
            class: 'wawi-text-style'
          }
        }),
        StarterKit.configure({
          blockquote: {
            HTMLAttributes: {
              class: 'wawi-quote'
            }
          },
          heading: {
            levels: [1, 2, 3, 4, 5, 6]
          },
          horizontalRule: {
            HTMLAttributes: {
              class: 'wawi-hr'
            }
          },
          history: {
            depth: 100,
            newGroupDelay: 750
          }
        }),
        Underline.configure({
          HTMLAttributes: {
            class: 'wawi-underline'
          }
        }),
        Subscript.configure({
          HTMLAttributes: {
            class: 'wawi-subscript'
          }
        }),
        Superscript.configure({
          HTMLAttributes: {
            class: 'wawi-superscript'
          }
        }),
        Link.configure({
          HTMLAttributes: {
            class: 'wawi-link',
            rel: 'noopener noreferrer',
            target: '_blank'
          },
          openOnClick: true,
          autolink: false,
          validate: (url: string) => {
            return url.startsWith('http://') || url.startsWith('https://')
          }
        }),
        Highlight.configure({
          HTMLAttributes: {
            class: 'wawi-highlight'
          },
          multicolor: true
        }),
        FontFamily.configure({
          types: ['textStyle']
        }),
        Table.configure({
          resizable: true
        }),
        TableRow,
        TableCell,
        TableHeader,
        CharacterCount.configure({
          limit: 131072,
          mode: 'textSize'
        }),
        Color.configure({
          types: ['textStyle']
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
          defaultAlignment: 'left',
          alignments: ['left', 'center', 'right', 'justify']
        }),
        Placeholder.configure({
          emptyEditorClass: 'wawi-is-editor-empty',
          emptyNodeClass: 'wawi-is-empty',
          placeholder: 'Hier könnte auch was Sinnvolles stehen...'
        })
      ]
    }))
    const fontSizes: { size: number; label: string; }[] = [
      { size: 0, label: 'Normal' },
      { size: 1, label: 'Überschrift 1' },
      { size: 2, label: 'Überschrift 2' },
      { size: 3, label: 'Überschrift 3' },
      { size: 4, label: 'Überschrift 4' },
      { size: 5, label: 'Überschrift 5' },
      { size: 6, label: 'Überschrift 6' }
    ]
    const fontFamilies: string[] = ['Helvetica', 'Arial', 'Verdana', 'Trebuchet MS', 'Impact', 'Gill Sans',
      'Times New Roman', 'Georgia', 'Palatino', 'Luminari', 'Bradley Hand', 'Lucida', 'Andalé Mono']
    const selectedFontFamily = ref<string>('Arial')
    const selectedHighlightColor = ref<string>('#9e47fa')
    const selectedTextColor = ref<string>('#ffffff')
    const selectedFontSize = ref<{ size: number, label: string }>(fontSizes[0])
    function toggleBlockquote (editor: Editor | undefined) {
      editor?.chain().focus().toggleBlockquote().run()
    }
    function toggleBold (editor: Editor | undefined) {
      editor?.chain().focus().toggleBold().run()
    }
    function toggleItalic (editor: Editor | undefined) {
      editor?.chain().focus().toggleItalic().run()
    }
    function toggleBulletList (editor: Editor | undefined) {
      editor?.chain().focus().toggleBulletList().run()
    }
    function sinkListItem (editor: Editor | undefined) {
      editor?.chain().focus().sinkListItem('listItem').run()
    }
    function splitListItem (editor: Editor | undefined) {
      editor?.chain().focus().splitListItem('listItem').run()
    }
    function liftListItem (editor: Editor | undefined) {
      editor?.chain().focus().liftListItem('listItem').run()
    }
    function toggleHeading (editor: Editor | undefined) {
      switch (selectedFontSize.value.size) {
        case 0:
          setParagraph(editor)
          break
        case 1:
          editor?.chain().focus().toggleHeading({ level: 1 }).run()
          break
        case 2:
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
          break
        case 3:
          editor?.chain().focus().toggleHeading({ level: 3 }).run()
          break
        case 4:
          editor?.chain().focus().toggleHeading({ level: 4 }).run()
          break
        case 5:
          editor?.chain().focus().toggleHeading({ level: 5 }).run()
          break
        case 6:
          editor?.chain().focus().toggleHeading({ level: 6 }).run()
          break
      }
    }
    function setParagraph (editor: Editor | undefined) {
      editor?.chain().focus().setParagraph().run()
      selectedFontSize.value = fontSizes[0]
    }
    watch(selectedFontSize, async () => {
      if (editor.value) {
        toggleHeading(editor.value)
      }
    })
    function setHorizontalLine (editor: Editor | undefined) {
      editor?.chain().focus().setHorizontalRule().run()
    }
    function toggleStrike (editor: Editor | undefined) {
      editor?.chain().focus().toggleStrike().run()
    }
    function toggleUnderline (editor: Editor | undefined) {
      editor?.chain().focus().toggleUnderline().run()
    }
    function toggleSubScript (editor: Editor | undefined) {
      editor?.chain().focus().toggleSubscript().run()
    }
    function toggleSuperScript (editor: Editor | undefined) {
      editor?.chain().focus().toggleSuperscript().run()
    }
    function toggleHighlight (editor: Editor | undefined) {
      editor?.chain().focus().toggleHighlight({ color: selectedHighlightColor.value }).run()
    }
    function unsetHighlight (editor: Editor | undefined) {
      editor?.commands.unsetHighlight()
    }
    function setFontFamily (editor: Editor | undefined) {
      editor?.chain().focus().setFontFamily(selectedFontFamily.value).run()
    }
    watch(selectedFontFamily, async () => {
      if (editor.value) {
        setFontFamily(editor.value)
      }
    })
    function addDefaultTable (editor: Editor | undefined) {
      editor?.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
    }
    function addColumnBefore (editor: Editor | undefined) {
      editor?.chain().focus().addColumnBefore().run()
    }
    function addColumnAfter (editor: Editor | undefined) {
      editor?.chain().focus().addColumnAfter().run()
    }
    function deleteColumn (editor: Editor | undefined) {
      editor?.chain().focus().deleteColumn().run()
    }
    function addRowBefore (editor: Editor | undefined) {
      editor?.chain().focus().addRowBefore().run()
    }
    function addRowAfter (editor: Editor | undefined) {
      editor?.chain().focus().addRowAfter().run()
    }
    function deleteRow (editor: Editor | undefined) {
      editor?.chain().focus().deleteRow().run()
    }
    function deleteTable (editor: Editor | undefined) {
      editor?.chain().focus().deleteTable().run()
    }
    function mergeCells (editor: Editor | undefined) {
      editor?.chain().focus().mergeCells().run()
    }
    function splitCell (editor: Editor | undefined) {
      editor?.chain().focus().splitCell().run()
    }
    function setTextColor (editor: Editor | undefined) {
      editor?.chain().focus().setColor(selectedTextColor.value).run()
    }
    function unsetTextColor (editor: Editor | undefined) {
      editor?.chain().focus().unsetColor().run()
    }
    function alignLeft (editor: Editor | undefined) {
      editor?.chain().focus().setTextAlign('left').run()
    }
    function alignCenter (editor: Editor | undefined) {
      editor?.chain().focus().setTextAlign('center').run()
    }
    function alignRight (editor: Editor | undefined) {
      editor?.chain().focus().setTextAlign('right').run()
    }
    function alignJustify (editor: Editor | undefined) {
      editor?.chain().focus().setTextAlign('justify').run()
    }
    function undo (editor: Editor | undefined) {
      if (editor?.can().undo()) {
        editor?.commands.undo()
      }
    }
    function redo (editor: Editor | undefined) {
      if (editor?.can().redo()) {
        editor?.commands.redo()
      }
    }
    function toggleLink (editor: Editor | undefined) {
      const previousUrl = editor?.getAttributes('link').href
      const url = window.prompt('URL', previousUrl)
      // cancelled
      if (url === null) {
        return
      }

      // empty
      if (url === '') {
        editor?.chain().focus().extendMarkRange('link').unsetLink().run()
        return
      }

      // update link
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    const editorContent = computed(() => {
      return editor.value?.getHTML()
    })
    watch(editorContent, () => {
      if (editor.value) {
        emit('updateContent', editorContent.value)
      }
    })
    onMounted(() => {
      if (props.initialContent?.length > 0) {
        editor.value?.commands.setContent(props.initialContent)
      }
    })
    return {
      editor,
      toggleBlockquote,
      toggleBold,
      toggleItalic,
      toggleBulletList,
      sinkListItem,
      splitListItem,
      liftListItem,
      toggleHeading,
      setParagraph,
      fontSizes,
      selectedFontSize,
      setHorizontalLine,
      toggleStrike,
      toggleUnderline,
      toggleSubScript,
      toggleSuperScript,
      selectedHighlightColor,
      toggleHighlight,
      fontFamilies,
      selectedFontFamily,
      setFontFamily,
      addDefaultTable,
      addColumnBefore,
      addColumnAfter,
      deleteColumn,
      addRowBefore,
      addRowAfter,
      deleteRow,
      deleteTable,
      mergeCells,
      splitCell,
      selectedTextColor,
      setTextColor,
      unsetTextColor,
      alignLeft,
      alignCenter,
      alignRight,
      alignJustify,
      undo,
      redo,
      toggleLink,
      unsetHighlight
    }
  }
})
</script>
<style scoped>
.tt-editor-header {
  background-color: #606061;
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
}
.tt-editor-counter-default {
  color: #8a8a8a;
}
.tt-editor-counter-close {
  color: #d0892b;
}
.tt-editor-counter-limit {
  color: #d34040;
}
.tt-editor-outer {
  border-radius: 6px;
  background-color: #33333f;
}
.wawi-tt-table-header {
  border-bottom: 1px solid #e0e0e0;
}
</style>
<style lang="scss">
.tiptap {
  table {
    border-collapse: collapse;
    width: 100%;
    border: 1px solid #e0e0e0;
    table-layout: fixed;
    overflow: hidden;
  }
  td, th {
    min-width: 1em;
    border: 2px solid #ced4da;
    padding: 3px 5px;
    vertical-align: top;
    box-sizing: border-box;
    position: relative;
  }
  > * {
    margin-bottom: 0;
  }
  th {
    font-weight: bold;
    text-align: left;
    background-color: rgba(241, 243, 245, 0.13);
  }
  p {
    margin: 0;
  }
}
</style>
