import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.openAndReindent', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No file is currently open');
            return;
        }

        const document = editor.document;
        const VersionRPG = editor.document.languageId;
        const text = document.getText();
        let indentPosition: number;
        let regexAddIndent:    RegExp;
        let regexAddRmvIndent: RegExp;
        let regexRmvIndent:    RegExp;
        let reindentedText:    string = "";

        // Valida el tipo de fuente y aplica indentación solo dentro de los bloques IF, ENDIF y DO
        if (VersionRPG === 'rpg' ||  VersionRPG === 'RPG' || VersionRPG === 'rpt' ||  VersionRPG === 'RPT' ) {  

          indentPosition = 27; 
          regexAddIndent = /^(.{5}C[^*].{20})(IF|DO)/i;
          regexAddRmvIndent = /^(.{5}C[^*].{20})(ELSE)/i;
          regexRmvIndent = /^(.{5}C[^*].{20})END/i;      
        }else {
            indentPosition = 25;  
            regexAddIndent = /^(.{5}C[^*].{18})(IF|DO)/i;
            regexAddRmvIndent = /^(.{5}C[^*].{18})(ELSE)/i;
            regexRmvIndent = /^(.{5}C[^*].{18})END/i;
        };    

        reindentedText = indentRpgCode(text,indentPosition,regexAddIndent,regexAddRmvIndent,regexRmvIndent);    

        const uri = vscode.Uri.parse('untitled:Reindented_' + document.fileName);

        // Crear un nuevo documento con el texto reindentado
        const newDoc = await vscode.workspace.
         openTextDocument({ content: reindentedText });

      // Mostrar el nuevo documento en modo preview
      await vscode.window.showTextDocument(newDoc, { preview: true }); 
        
		
    });

    context.subscriptions.push(disposable);
}

function indentRpgCode(text: string,indentPosition: number, regexAddIndent: RegExp, regexAddRmvIndent: RegExp, regexRmvIndent: RegExp): string {
    const lines = text.split('\n');
    let indentLevel = 0;
    const indent = '|  ';

    const processedLines = lines.map(line => {
        if (line.charAt(6) === '*') {
            return line;
        }
        else if (regexAddIndent.test(line)) {
            const currentLine = line.slice(0, indentPosition) + indent.repeat(indentLevel) + line.slice(indentPosition);
            indentLevel++; // Incrementa el nivel de indentación después de procesar la línea
            return currentLine;
        }
        else if (regexRmvIndent.test(line)) {
            indentLevel = Math.max(0, indentLevel - 1); // Decrementa el nivel de indentación antes de procesar la línea
            return line.slice(0, indentPosition) + indent.repeat(indentLevel) + line.slice(indentPosition);
        }
        else if (regexAddRmvIndent.test(line)) {
            indentLevel = Math.max(0, indentLevel - 1); // Decrementa el nivel de indentación antes de procesar la línea
            const currentLine = line.slice(0, indentPosition) + indent.repeat(indentLevel) + line.slice(indentPosition);
            indentLevel++;
            return currentLine;
        }
        else {
            return line.slice(0, indentPosition) + indent.repeat(indentLevel) + line.slice(indentPosition);
        }
    });

    return processedLines.join('\n');
}

export function deactivate() {}
  