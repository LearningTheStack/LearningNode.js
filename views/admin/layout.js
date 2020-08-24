//content will be a string which we will add into the middle of our layout
module.exports = ({ content }) => {
    return `
    <!DOCTYPE html>
    <html>
        <head>
        </head>
        <body>
            ${content}
        </body>
    </html>
    `;
};