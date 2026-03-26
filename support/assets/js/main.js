// ------------------------- Loader Spiner
$(window).on("load", function () {
  setTimeout(function () {
    $(".loader").fadeOut();
    $(".loader-mask").fadeOut("slow");
  }, 1000);
});

/*=============== SHOW SIDEBAR ===============*/
/*=============== SHOW SIDEBAR ===============*/
const showSidebar = (toggleId, sidebarId, headerId, mainId) => {
  const $toggle = $("#" + toggleId),
    $sidebar = $("#" + sidebarId),
    $header = $("#" + headerId),
    $main = $("#" + mainId);
  if ($toggle.length && $sidebar.length && $header.length && $main.length) {
    $toggle.on("click", function () {
      $sidebar.toggleClass("show-sidebar");
      $header.toggleClass("left-pd");
      $main.toggleClass("left-pd");
    });
  }
};
showSidebar("header-toggle", "sidebar", "header", "main");
/*=============== LINK ACTIVE ===============*/
$(document).ready(function () {
  function linkColor() {
    $(".sidebar__list a").removeClass("active-link");
    $(this).addClass("active-link");
  }
  $(".sidebar__list").on("click", "a", linkColor);
});
// ----------------- logo hide and show favicon logo
$(document).ready(function () {
  const $toggleBtn = $(".header__toggle");
  const $fullLogo = $(".fully_logo");
  const $favLogo = $(".favicon_logo");
  let isFullLogo = true;

  $toggleBtn.on("click", function () {
    if (isFullLogo) {
      $fullLogo.addClass("hide-anim");
      setTimeout(() => {
        $fullLogo.css("display", "none");
        $fullLogo.removeClass("hide-anim");
        $favLogo.css("display", "flex");
        $favLogo.addClass("hide-anim");
        requestAnimationFrame(() => {
          $favLogo.removeClass("hide-anim");
        });
      }, 150);
    } else {
      $favLogo.addClass("hide-anim");
      setTimeout(() => {
        $favLogo.css("display", "none");
        $favLogo.removeClass("hide-anim");
        $fullLogo.css("display", "flex");
        $fullLogo.addClass("hide-anim");
        requestAnimationFrame(() => {
          $fullLogo.removeClass("hide-anim");
        });
      }, 150);
    }

    isFullLogo = !isFullLogo;
  });
});
// --------------------- Drop down Open close
$(document).ready(function () {
  $(".navbar-link").on("click", function (e) {
    e.preventDefault();
    const $submenu = $(this).next(".dropdown-data");
    $(".dropdown-data").not($submenu).removeClass("show");
    $(".navbar-link").not(this).removeClass("active");
    $(this).toggleClass("active");
    $submenu.toggleClass("show");
  });
});

$(document).ready(function () {
  const $toggleButton = $(".header__toggle");
  const $gettingLine = $(".getting-line");
  const $pack = $(".pack");
  const $condense = $(".condense");
  const $navbarLink = $(".navbar-link");
  let isToggled = false;

  $toggleButton.on("click", function () {
    if (!isToggled) {
      $gettingLine.css("display", "none");
      $pack.css("display", "none");
      $condense.css("display", "none");
      $navbarLink.css("justify-content", "center");
    } else {
      $gettingLine.css("display", "block");
      $pack.css("display", "block");
      $condense.css("display", "block");
      $navbarLink.css("justify-content", "space-between");
    }
    isToggled = !isToggled;
  });
});

//------------------------- Get the elements ---90px close dropdown none
$(document).ready(function () {
  const $faviconLogo = $(".favicon_logo");
  const $dropdownData = $(".dropdown-data");

  function toggleDropdown() {
    $dropdownData.each(function () {
      if ($faviconLogo.css("display") === "flex") {
        $(this).css("display", "none");
      } else {
        $(this).css("display", "flex");
      }
    });
  }
  $faviconLogo.on("click", toggleDropdown);
});

//------------------------- Function to toggle .dropdown-data display on each navbar-link click
$(document).ready(function () {
  const $faviconLogo = $(".favicon_logo");
  const $dropdownData = $(".dropdown-data");
  const $navbarLinkData = $(".navbar-link");
  function toggleDropdown() {
    $dropdownData.each(function () {
      if ($faviconLogo.css("display") === "flex") {
        $(this).css("display", "none");
      } else {
        $(this).css("display", "flex");
      }
    });
  }
  $navbarLinkData.on("click", function () {
    toggleDropdown();
  });
});

// ------------------------- nav acrtive
$(document).ready(function () {
  $(".hx-topic").click(function () {
    $(".hx-topic").removeClass("active");
    $(this).addClass("active");
  });

  //------------------------- Scroll-based activation
  const sections = [
    "introduction",
    "core_features",
    "file_structure",
    "file_starter",
    "customization",
    "introduction_one",
    "introduction_two",
    "introduction_four",
    "introduction_five",
    "introduction_six",
    "introduction_seven",
    "introduction_eight",
    "introduction_nine",
    "introduction_tan",
  ];

  $(window).on("scroll", function () {
    let scrollPosition = $(document).scrollTop();

    for (let i = 0; i < sections.length; i++) {
      let sectionId = sections[i];
      let section = $("#" + sectionId);

      if (section.length) {
        let offsetTop = section.offset().top - 200;
        let offsetBottom = offsetTop + section.outerHeight();

        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
          $(".hx-topic").removeClass("active");
          $(`.hx-topic[href$="#${sectionId}"]`).addClass("active");
          break;
        }
      }
    }
  });
});

/*=============== DARK LIGHT THEME ===============*/
$(document).ready(function () {
  const $themeButton = $("#theme-button");
  const darkTheme = "dark-theme";
  const iconTheme = "ri-sun-fill";
  const selectedTheme = localStorage.getItem("selected-theme");
  const selectedIcon = localStorage.getItem("selected-icon");
  const getCurrentTheme = () =>
    $("body").hasClass(darkTheme) ? "dark" : "light";
  const getCurrentIcon = () =>
    $themeButton.hasClass(iconTheme) ? "ri-moon-clear-fill" : "ri-sun-fill";
  if (selectedTheme) {
    $("body").toggleClass(darkTheme, selectedTheme === "dark");
    $themeButton.toggleClass(iconTheme, selectedIcon === "ri-moon-clear-fill");
  }
  $themeButton.on("click", function () {
    $("body").toggleClass(darkTheme);
    $themeButton.toggleClass(iconTheme);
    localStorage.setItem("selected-theme", getCurrentTheme());
    localStorage.setItem("selected-icon", getCurrentIcon());
  });
});

// _navbar link
$(document).ready(function () {
  $(document).on("click", ".navbar-link", function (event) {
    event.preventDefault();
    const targetUrl = $(this).attr("href");
    window.location.href = targetUrl;
  });
});

// Full Screen Popup Box
$(".gx-full-card").on("click", function () {
  $(this).hide();

  $(this)
    .parent(".header-tools")
    .append(
      '<a href="javascript:void(0)" class="m-l-10 gx-full-card-close"><i class="ri-close-fill"></i></a>'
    );

  const cardWrapper = $(this).closest(".gx-card").parent();
  cardWrapper.addClass("gx-full-screen");

  setTimeout(() => {
    cardWrapper.addClass("active");
  }, 10);

  $(this)
    .closest(".gx-card")
    .parent()
    .parent()
    .append('<div class="gx-card-overlay show"></div>');
});

$("body").on("click", ".gx-card-overlay, .gx-full-card-close", function () {
  $(".gx-card").find(".gx-full-card-close").remove();
  $(".gx-card").find(".gx-full-card").show();

  const cardWrapper = $(".gx-card").parent();
  cardWrapper.removeClass("active");

  setTimeout(() => {
    cardWrapper.removeClass("gx-full-screen");
  }, 300);

  $(".gx-card-overlay").removeClass("show");
  setTimeout(() => {
    $(".gx-card-overlay").remove();
  }, 300);
});
