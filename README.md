# Vereda 386 Arquitetura — landing page

Site de página única da Vereda 386 Arquitetura (Arq. Amanda Cavalcanti). HTML, CSS e JavaScript puros, sem build.

## Ver localmente

```bash
python3 -m http.server 5195
```

e abra http://localhost:5195.

## Onde mexer

- **Contatos** (WhatsApp, e-mail, Instagram): objeto `CONTATO` no topo de `js/main.js`. O e-mail atual é fictício.
- **Textos**: `index.html`.
- **Visual**: `css/style.css` (cores em `:root`). Ao editar CSS/JS, suba o `?v=` no `index.html` para evitar cache.
- **Fotos e vídeos**: `assets/img` e `assets/video`. Cada vídeo tem uma imagem de capa que aparece na hora; o vídeo só é baixado depois que a página carrega.

## Publicação

Hospedado na Vercel (site estático). `vercel.json` define cabeçalhos de segurança e cache.

Enquanto o site não tiver domínio próprio, ele fica com `X-Robots-Tag: noindex` para não ser indexado pelo endereço provisório. **Ao ligar o domínio oficial, remova essa linha do `vercel.json`** para o Google indexar o site.

## Licença

Código: uso do cliente. Fotos, vídeos, logo e textos pertencem à Vereda 386 Arquitetura.
