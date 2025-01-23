var Product = /** @class */ (function () {
    function Product(name, unitPrice) {
        this.name = name;
        this.unitPrice = unitPrice;
        this.name = name;
        this.unitPrice = unitPrice;
    }
    Product.prototype.getDiscountedPrice = function (discount) {
        return this.price - discount;
    };
    return Product;
}());
var table = new Product("Table", 45);
console.log(table.getDiscountedPrice(5));
