/* UrbanEdge - site interactions */

(function() {
    "use strict";

    /* ---- grab elements ---- */
    var header = document.getElementById("siteHeader");
    var backToTop = document.getElementById("backToTop");
    var filterPills = document.querySelectorAll(".filter-pill");
    var productCols = document.querySelectorAll(".product-col");
    var searchInput = document.getElementById("searchInput");
    var menuToggle = document.getElementById("menuToggle");
    var navLinks = document.getElementById("navLinks");
    var cartCountEl = document.getElementById("cartCount");
    var productCountEl = document.getElementById("productCount");

    /* ---- header shadow on scroll ---- */
    window.addEventListener("scroll", function() {
        var y = window.scrollY;
        if (y > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        if (y > 400) {
            backToTop.classList.add("visible");
        } else {
            backToTop.classList.remove("visible");
        }
    });

    backToTop.addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    /* ---- product filter tabs ---- */
    var activeCategory = "all";

    filterPills.forEach(function(pill) {
        pill.addEventListener("click", function() {
            activeCategory = this.getAttribute("data-filter");
            filterPills.forEach(function(p) {
                p.classList.remove("active");
            });
            this.classList.add("active");
            applyAllFilters();
        });
    });

    /* ---- brand checkbox filters ---- */
    var brandChecks = document.querySelectorAll(".brand-filter");
    var priceRange = document.getElementById("priceRange");
    var priceVal = document.getElementById("priceVal");
    var clearFiltersBtn = document.getElementById("clearFilters");

    brandChecks.forEach(function(cb) {
        cb.addEventListener("change", function() {
            applyAllFilters();
        });
    });

    /* price range slider */
    if (priceRange) {
        priceRange.addEventListener("input", function() {
            var val = parseInt(this.value);
            priceVal.textContent = val.toLocaleString("en-IN");
            applyAllFilters();
        });
    }

    /* clear all filters */
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", function() {
            brandChecks.forEach(function(cb) {
                cb.checked = true;
            });
            if (priceRange) {
                priceRange.value = 10000;
                priceVal.textContent = "10,000";
            }
            filterPills.forEach(function(p) {
                p.classList.remove("active");
            });
            filterPills[0].classList.add("active");
            activeCategory = "all";
            searchInput.value = "";
            applyAllFilters();
        });
    }

    /* helper: get price number from text like ₹1,299 */
    function parsePrice(text) {
        var cleaned = text.replace(/[^\d]/g, "");
        return parseInt(cleaned) || 0;
    }

    /* master filter function that combines category + brand + price + search */
    function applyAllFilters() {
        var query = searchInput.value.toLowerCase().trim();
        var maxPrice = priceRange ? parseInt(priceRange.value) : 99999;

        /* gather checked brands */
        var checkedBrands = [];
        brandChecks.forEach(function(cb) {
            if (cb.checked) {
                checkedBrands.push(cb.value.toLowerCase());
            }
        });

        var visibleCount = 0;

        productCols.forEach(function(col) {
            var cat = col.getAttribute("data-category");
            var name = col.querySelector(".item-name").textContent.toLowerCase();
            var brand = col.querySelector(".item-brand").textContent.toLowerCase();
            var priceText = col.querySelector(".now").textContent;
            var price = parsePrice(priceText);

            var matchCategory = (activeCategory === "all" || cat === activeCategory);
            var matchBrand = checkedBrands.indexOf(brand) !== -1;
            var matchPrice = price <= maxPrice;
            var matchSearch = (query === "" || name.indexOf(query) !== -1 || brand.indexOf(query) !== -1);

            if (matchCategory && matchBrand && matchPrice && matchSearch) {
                col.style.display = "";
                col.style.animation = "fadeIn 0.4s ease forwards";
                visibleCount++;
            } else {
                col.style.display = "none";
            }
        });

        productCountEl.textContent = visibleCount + " product" + (visibleCount !== 1 ? "s" : "") + " found";
    }

    /* ---- sort dropdown ---- */
    var sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", function() {
            var grid = document.getElementById("productsGrid");
            var cols = Array.prototype.slice.call(grid.querySelectorAll(".product-col"));
            var sortVal = this.value;

            cols.sort(function(a, b) {
                if (sortVal === "low") {
                    return parsePrice(a.querySelector(".now").textContent) - parsePrice(b.querySelector(".now").textContent);
                }
                if (sortVal === "high") {
                    return parsePrice(b.querySelector(".now").textContent) - parsePrice(a.querySelector(".now").textContent);
                }
                if (sortVal === "name") {
                    var na = a.querySelector(".item-name").textContent;
                    var nb = b.querySelector(".item-name").textContent;
                    return na.localeCompare(nb);
                }
                return 0;
            });

            cols.forEach(function(col) {
                grid.appendChild(col);
            });
        });
    }

    /* ---- search input ---- */
    searchInput.addEventListener("input", function() {
        applyAllFilters();
    });

    /* ---- wishlist toggle ---- */
    var hearts = document.querySelectorAll(".wishlist-btn");
    hearts.forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            e.stopPropagation();
            this.classList.toggle("active");
            this.innerHTML = this.classList.contains("active") ? "&#9829;" : "&#9825;";
        });
    });

    /* ---- cart system ---- */
    var cartItems = [];
    var cartDrawer = document.getElementById("cartDrawer");
    var cartOverlay = document.getElementById("cartOverlay");
    var cartBody = document.getElementById("cartBody");
    var cartSubtotal = document.getElementById("cartSubtotal");
    var cartBtn = document.getElementById("cartBtn");
    var cartClose = document.getElementById("cartClose");
    var continueShopping = document.getElementById("continueShopping");

    function openCart() {
        cartDrawer.classList.add("open");
        cartOverlay.classList.add("active");
    }

    function closeCart() {
        cartDrawer.classList.remove("open");
        cartOverlay.classList.remove("active");
    }

    cartBtn.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);
    continueShopping.addEventListener("click", closeCart);

    function renderCart() {
        cartCountEl.textContent = cartItems.length;
        if (cartItems.length === 0) {
            cartBody.innerHTML = '<div class="cart-empty text-center"><p style="font-size:2.5rem;">&#128722;</p><h4>Your cart is empty</h4><p class="text-muted">Looks like you haven\'t added anything yet.</p><button class="btn btn-primary" onclick="document.getElementById(\'cartDrawer\').classList.remove(\'open\');document.getElementById(\'cartOverlay\').classList.remove(\'active\');">Continue Shopping</button></div>';
            cartSubtotal.textContent = "\u20B90";
            return;
        }
        var html = "";
        var total = 0;
        cartItems.forEach(function(item, i) {
            total += item.price;
            html += '<div class="cart-item">';
            html += '<img src="' + item.img + '" alt="' + item.name + '">';
            html += '<div class="cart-item-info"><h4>' + item.name + '</h4><p>' + item.brand + ' &mdash; \u20B9' + item.price.toLocaleString("en-IN") + '</p></div>';
            html += '<button class="cart-item-remove" data-index="' + i + '">&times;</button>';
            html += '</div>';
        });
        cartBody.innerHTML = html;
        cartSubtotal.textContent = "\u20B9" + total.toLocaleString("en-IN");

        /* remove item buttons */
        var removeBtns = cartBody.querySelectorAll(".cart-item-remove");
        removeBtns.forEach(function(btn) {
            btn.addEventListener("click", function() {
                var idx = parseInt(this.getAttribute("data-index"));
                cartItems.splice(idx, 1);
                renderCart();
            });
        });
    }

    function addToCart(card) {
        var img = card.querySelector(".item-thumb img").getAttribute("src");
        var name = card.querySelector(".item-name").textContent;
        var brand = card.querySelector(".item-brand").textContent;
        var price = parsePrice(card.querySelector(".now").textContent);
        cartItems.push({
            img: img,
            name: name,
            brand: brand,
            price: price
        });
        renderCart();
        openCart();
    }

    /* quick add buttons */
    var addButtons = document.querySelectorAll(".quick-add");
    addButtons.forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            e.stopPropagation();
            var card = this.closest(".item-card");
            addToCart(card);
            this.textContent = "Added!";
            var self = this;
            setTimeout(function() {
                self.textContent = "+ Quick Add";
            }, 1000);
        });
    });

    /* ---- product quick-view modal ---- */
    var modal = document.getElementById("productModal");
    var modalClose = document.getElementById("modalClose");
    var modalImg = document.getElementById("modalImg");
    var modalBrand = document.getElementById("modalBrand");
    var modalName = document.getElementById("modalName");
    var modalRating = document.getElementById("modalRating");
    var modalPrice = document.getElementById("modalPrice");
    var modalAddCart = document.getElementById("modalAddCart");

    var currentModalCard = null;

    /* clicking on a product card (not button) opens modal */
    var itemCards = document.querySelectorAll(".item-card");
    itemCards.forEach(function(card) {
        card.addEventListener("click", function() {
            currentModalCard = this;
            modalImg.src = this.querySelector(".item-thumb img").src;
            modalBrand.textContent = this.querySelector(".item-brand").textContent;
            modalName.textContent = this.querySelector(".item-name").textContent;
            modalRating.innerHTML = this.querySelector(".item-rating").innerHTML;
            modalPrice.innerHTML = this.querySelector(".item-price").innerHTML;
            modal.classList.add("active");
        });
    });

    modalClose.addEventListener("click", function() {
        modal.classList.remove("active");
    });
    modal.addEventListener("click", function(e) {
        if (e.target === modal) modal.classList.remove("active");
    });
    modalAddCart.addEventListener("click", function() {
        if (currentModalCard) {
            addToCart(currentModalCard);
            modal.classList.remove("active");
        }
    });

    /* ---- newsletter form ---- */
    var form = document.getElementById("newsletterForm");
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        var input = this.querySelector("input");
        var button = this.querySelector("button");
        var orig = button.textContent;
        button.textContent = "Subscribed!";
        button.style.background = "#16a34a";
        button.style.borderColor = "#16a34a";
        input.value = "";
        setTimeout(function() {
            button.textContent = orig;
            button.style.background = "";
            button.style.borderColor = "";
        }, 2000);
    });

    /* ---- mobile menu toggle ---- */
    menuToggle.addEventListener("click", function() {
        navLinks.classList.toggle("mobile-open");
    });
    var menuLinks = navLinks.querySelectorAll("a");
    menuLinks.forEach(function(link) {
        link.addEventListener("click", function() {
            navLinks.classList.remove("mobile-open");
        });
    });

    /* ---- countdown timer (7 days from now) ---- */
    var deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    function updateCountdown() {
        var now = new Date().getTime();
        var diff = deadline.getTime() - now;
        if (diff < 0) diff = 0;

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var secs = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById("cdDays").textContent = days < 10 ? "0" + days : days;
        document.getElementById("cdHours").textContent = hours < 10 ? "0" + hours : hours;
        document.getElementById("cdMins").textContent = mins < 10 ? "0" + mins : mins;
        document.getElementById("cdSecs").textContent = secs < 10 ? "0" + secs : secs;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    /* ---- scroll reveal animation ---- */
    var revealSections = document.querySelectorAll(".browse-section, .gallery-section, .reviews-section, .signup-strip");
    revealSections.forEach(function(el) {
        el.classList.add("reveal");
    });

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.12
    });

    revealSections.forEach(function(el) {
        observer.observe(el);
    });

})();