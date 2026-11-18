
const apiKey = document.getElementById("apiKey");
const campoMensagem = document.getElementById("mensagem");
const mensagens = document.getElementById("mensagens");
const btnEnviar = document.getElementById("btnEnviar");

// Instrução de sistema do chatbot
const instrucaoSistema = `
Você é o Bot-Encantado, assistente virtual da confeitaria artesanal "Doce Encanto".
Sua função é auxiliar clientes com dúvidas sobre doces, bolos, sabores, preços e encomendas.

Responda de forma simpática, objetiva e curta.

Para perguntas que não sejam saudações ou que fujam do contexto da doceria "Doce Encanto", responda exatamente:
"Estou configurado com a função de auxiliar no contexto da doceria Doce Encanto. Esta pergunta foge do meu contexto."
`;
// Adiciona mensagens na tela
function adicionarMensagem(texto, tipo) {
    const div = document.createElement("div");

    div.classList.add("mensagem", tipo);
    div.textContent = texto;

    mensagens.appendChild(div);
    mensagens.scrollTop = mensagens.scrollHeight;
}

// Envia mensagem para a API
async function enviarMensagem() {
    const chave = apiKey.value.trim();
    const texto = campoMensagem.value.trim();

    if (!chave) {
        alert("Digite sua chave da API!");
        return;
    }

    if (!texto) {
        alert("Digite uma mensagem!");
        return;
    }

    adicionarMensagem(texto, "usuario");

    campoMensagem.value = "";
    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";

    try {
        const resposta = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${chave}`
                },

                body: JSON.stringify({
                    model: "gpt-5.4-nano",
                    instructions: instrucaoSistema,
                    input: texto,
                    temperature: 0.3,
                    max_output_tokens: 20
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.error?.message || "Erro ao conectar com a API."
            );
        }

        // Obtém o texto da resposta
        const textoResposta = dados.output
            ?.flatMap(item => item.content || [])
            .filter(item => item.type === "output_text")
            .map(item => item.text)
            .join("\n");

        adicionarMensagem(
            textoResposta || "Não foi possível obter uma resposta.",
            "bot"
        );

    } catch (erro) {
        adicionarMensagem(
            "Erro: " + erro.message,
            "bot"
        );

    } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = "Enviar ✨";
        campoMensagem.focus();
    }
}

// Clique no botão
btnEnviar.addEventListener("click", enviarMensagem);

// Envio com a tecla Enter
campoMensagem.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        enviarMensagem();
    }
});
