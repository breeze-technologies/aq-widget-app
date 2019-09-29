# Air Quality Widget

## EU Common Air Quality Index

This is an air quality widget that you can embed into your website. It uses air quality data of official measurement stations provided by the European Environmental Agency.

## Usage instructions

To embed the widget into your website, follow these steps:

### 1. Obtain GPS coordinates for the location you want the widget to monitor

The widget uses a latitude-longitude-coordinate pair to find the closest station nearby. Use a GPS lookup service like [this one](https://www.gps-coordinates.net/) to obtain the coordinates. The widget will find official measurement stations within a distance of **5 kilometres**.

### 2. Add widget code to your website

Once you have your coordinates, you can integrate the widget into your website. Place the following code where you want the widget to appear in your page.

```html
<script src="widget.js"></script>
<div id="aq-widget"></div>
<script type="text/javascript">
    AQWidget.createStationWidget({
        location: { longitude: 9.98280644416809, latitude: 53.46437509422454 },
        elementId: "aq-widget",
    }); 
</script>
```

Do not forget to replace the coordinates with yours. The `elementId` option defines the HTML element ID in which the widget gets rendered. It should be a `<div>` element and you can style its position and size using CSS.

## Option reference

**location**
> A dict-like object containing the coordinates (`longitude` and `latitude`) for the position where the widget should look for an air quality station. A station needs to be available within a radius of 5 kilometres in order for the widget to show an air quality index.

**elementId**
> The ID of the HTML element in which the widget should be rendered. Ideally, a `<div>` element.

**iconUrl** (optional)
> URL that points to an image resource. If passed, the image will be shown within the widget. Using this option, a company logo or city emblem can be displayed.

**apiBase** (optional)
> If you host the widget's backend on own servers, you can change the URL base that the widget should use with this option.

**dataSource** (optional)
> Currently, only `"eea"` is supported as data source.

## Contact

If you have questions or other inquiries, contact us at hello@breeze-technologies.de.

---

Made with ❤️ at Breeze Technologies.

Licensed under the EUPL.
