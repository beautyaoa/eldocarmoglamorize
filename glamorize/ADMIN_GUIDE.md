# Guia da equipa — Admin Eldo Carmo Glamorize

Endereço: `https://eldocarmoglamorize.pages.dev/admin.html`  
(ou o domínio final quando estiver activo)

---

## Entrar

1. Abra a página de admin.
2. Introduza a **password da equipa**.
3. (Opcional) marque **Manter sessão iniciada** para não precisar de entrar de novo neste browser.
4. Use o ícone do olho para mostrar / ocultar a password.

Para sair: botão **Sair** no fundo do menu lateral.

---

## Menu lateral

| Secção | Para quê |
|--------|----------|
| **Painel** | Resumo: pedidos pendentes, totais, atalhos |
| **Encomendas** | Lista de pedidos / agendamentos · confirmar / entregar / cancelar |
| **Produtos** | Serviços (nomes, preços, descrições, fotos, activo/inactivo) |
| **Zonas** | Zonas de Luanda e taxas (Kz) — útil se houver deslocação |
| **Imagens** | Carregar fotos e copiar o link para um serviço |

Em telemóvel: toque no ícone ☰ no canto superior esquerdo para abrir o menu.

---

## Encomendas

1. Quando um cliente envia um pedido pelo site, aparece aqui.
2. Estados:
   - **Pendente** — nova
   - **Confirmada** — já falou com o cliente / preparada
   - **Entregue** — concluída
   - **Cancelada**
3. Use os botões em cada cartão ou o filtro (Todas / Pendentes / …).
4. **Actualizar** recarrega a lista.
5. **Eliminar** remove o pedido (pede confirmação).

### Se um pedido “não aparece”

- O site e o admin têm de estar ligados à **mesma API** (Worker).
- Se a API ainda não estiver configurada, os pedidos ficam só no **browser de quem enviou** e o admin noutro telemóvel/PC não os vê.
- Depois de o programador definir o `workerUrl` e publicar o Worker, os pedidos ficam centralizados e visíveis em qualquer dispositivo com login.

---

## Produtos (Serviços)

1. Edite nome, preço (Kz), descrição e caminho/URL da imagem.
2. Desmarque **Activo na loja** para esconder sem apagar.
3. **+ Produto** para adicionar um novo serviço.
4. **Guardar rascunho** — só neste browser.
5. **Publicar na loja** — envia as alterações para o site público (todos os clientes).

Sempre que mudar preços ou disponibilidade, use **Publicar na loja**.

Preço `0` = “Consultar preço” no site (pode ajustar no admin).

---

## Zonas

- Lista de zonas de Luanda com taxa em Kz.
- Pode activar/desactivar ou ajustar valores e depois **Publicar na loja**.

---

## Imagens

1. Abra **Imagens**.
2. Escolha ficheiros (foto do serviço).
3. Quando o envio terminar, clique **Copiar link**.
4. Vá a **Produtos** → cole o link no campo **Imagem**.
5. **Publicar na loja**.

As imagens vão para Cloudinary (pasta `glamorize`) via preset unsigned.

---

## Rascunho vs Publicar

| Acção | O que faz |
|-------|-----------|
| **Guardar rascunho** | Guarda só neste browser (localStorage) |
| **Publicar na loja** | Envia o catálogo para Cloudinary; o site público actualiza |

Se abrir o admin noutro dispositivo, vê o que está **publicado**, não o rascunho local.

---

## Problemas frequentes

- **Password incorrecta** — confirme com o responsável; a password só existe no Worker (segredo).
- **Publicar falha** — Worker ou secrets em falta; contacte quem faz o deploy.
- **Imagem não sobe** — confirme que o preset `glamorize_unsigned` existe na conta Cloudinary e aceita upload do browser.
