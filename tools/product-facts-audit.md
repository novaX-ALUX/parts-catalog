# Product content audit — 2026-09-07

This records source-backed corrections, not hardware qualification or approval of
new firmware. Released firmware bytes, hashes and signatures were not changed.

## FC source of truth

Compared the five public FC catalog pages and the hidden T10 entry against
[novaX FC board definitions at e93efe59](https://github.com/novaX-ALUX/fc/tree/e93efe59ef8d45ce7e88307d6ea240c6d6ed99a8/boards).
PWM counts distinguish motor/servo channels from LED and IOMCU outputs. UART and
I2C counts now state whether they count configured buses or physical connectors.
F7 mini has three configured IMUs, no IOMCU, and auxiliary PWM9–11. PX4/INAV
support is not claimed without a matching verified release. F4 nano v2 GNSS is
external and board-ID protection does not apply to raw DFU/SWD writes.

H7 nano's GPS is USART3/SERIAL3 and its RC connector is USART6/SERIAL6.
The old raster pinout contains conflicting serial labels, so the active page now
uses a source-maintainable SVG logical-port table. It is explicitly not a wiring
pin-order drawing. The raster is retained for historical recovery, not shown as
the current pinout. The hero image's legacy `Matek` filename was inspected against
the AF-H7 nano photo: the physical board photo matches, so its bytes were retained.
Barometer fitted-part DPS368 versus schematic-symbol DPS310 ambiguity is stated,
not resolved by guessing from the compatible firmware driver.

## GNSS source of truth

The receiver's 20 Hz position limit is distinct from the node's 10 Hz request and
unmeasured end-to-end CAN/heading performance.
[Septentrio mosaic-G5 P3H specifications](https://www.septentrio.com/en/products/gnss-receivers/gnss-receiver-modules/mosaic-G5-P3H).

The antenna bias current limit applies to both antennas combined, not to each
antenna separately. Both supplies share overcurrent shutdown.
[Septentrio hardware manual, section 4.2](https://www.septentrio.com/system/files/support/mosaic-g5_hardware_manual_v1.1.1.pdf).

## Automated coverage and limitations

`product-facts.test.mjs` prevents the identified content errors from returning.
The existing validator checks all 31 catalog products, 33 firmware entries,
release signatures, image paths and internal links. Browser checks visit each
product and its tabs, decode images and exercise updater selection without
requesting a hardware device. These checks do not certify every advertised
electrical, thermal, RF or mechanical specification of all 31 products.
