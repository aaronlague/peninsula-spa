(function () {
    'use strict';

    angular.module('spa.booking', ['ui.bootstrap'])

        .constant('timepickerConfig', {
            // available options for reservation time
            timeOptions: ['9:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00', '22:00']
        })

        .value('API', {
            languageCode: 'en',
            hotelCode: 'PHK',
            hotelJSON: 'http://www.mocky.io/v2/55d05fd5de9fdef104fe3727',
            unavailableDates: 'http://www.mocky.io/v2/55d0960dde9fdeaa08fe3743',
            availableTimes: 'http://www.mocky.io/v2/55d0962ade9fdeaa08fe3744',
            bookingFormSubmit: 'http://www.mocky.io/v2/55c7ebdc0c3c40d50c030323'
        }) 

        .constant('datepickerConfig', {
            formatDay: 'dd',
            formatMonth: 'MMMM',
            formatYear: 'yyyy',
            formatDayHeader: 'EEE',
            formatDayTitle: 'MMMM yyyy',
            formatMonthTitle: 'yyyy',
            datepickerMode: 'day',
            minMode: 'day',
            maxMode: 'day',
            showWeeks: false, 
            startingDay: 0,
            yearRange: 2,
            minDate: (function () {
                return new Date();
            })(),
            maxDate: (function () {
                var now = new Date();
                return new Date(now.setMonth(now.getMonth() + 3));
            })(),
            shortcutPropagation: true
        })
 
        .controller('MainController', function ($scope, $http, $window, dateFilter, $timeout, $sce, $filter, datepickerConfig, timepickerConfig, API) {

            $scope.detect = $window.Modernizr;
            $scope.activeFormPage = 1;
            $scope.booking = {};
            $scope.disabledDates = [];
            $scope.maxDate = datepickerConfig.maxDate;
            $scope.parseInt = parseInt;

            $scope.init = function () {
                /*var availableTimes = timepickerConfig.timeOptions.length
                alert(availableTimes);*/

                var request = $http({
                    method: 'get',
                    params: {
                        hotel: API.hotelCode
                    },
                    url: API.hotelJSON
                });

                request.success(function (data) {
                    /*jshint -W069*/
                    if (data && !data.error) {
                        $scope.treatmentTypes = data.hotel.treatmentCategories;
                        $scope.treatmentPackages = data.hotel.treatments;
                        $scope.booking.hotelCode = data.hotel.id;
                        $scope.serviceCharge = data.hotel.serviceCharge || '10%';
                        $scope.viewReady = true;
                    }
                    else {
                        $scope.apiErrorHotel = data.error;
                    }
                });

                request.error(function () {
                    $scope.apiErrorHotel = {
                        result: 'unknown'
                    };
                });

            };

            $scope.removeQuotes = function (string) {
                return string.replace(/^"?(.+?)"?$/, '$1');
            };

            $scope.updateDatePicker = function () {

                if (!$scope.booking.package && !$scope.booking.type) {
                    $scope.showCalendar = true;
                    return;
                }

                $scope.gettingUnvailableDates = true;

                var requestData = {
                    hotelCode: $scope.booking.hotelCode,
                    templateID: $scope.booking.package,
                    therapistGender: $scope.booking.gender
                };

                var request = $http({
                    method: 'post',
                    url: API.unavailableDates,
                    data: $.param(requestData),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });

                request.success(function (data) {
                    /*jshint camelcase: false */
                    if (data && !data.result) {
                        $scope.disabledDates = data.unavailable_dates;
                        $scope.$broadcast('refreshDatepickers');
                    }
                    else {
                        $scope.apiErrorDate = data;
                    }
                    $scope.gettingUnvailableDates = false;
                });

                request.error(function () {
                    $scope.apiErrorDate = {
                        result: 'unknown'
                    };
                    $scope.gettingUnvailableDates = false;
                });

            };

            $scope.updateTimePicker = function () {

                if (!$scope.booking.package || !$scope.treatmentDate) {
                    $scope.timepicker = false;
                    return;
                }

                $scope.gettingAvailableTime = true;
                $scope.availableTimes = [];


                var requestData = {
                    hotelCode: $scope.booking.hotelCode,
                    templateID: $scope.booking.package,
                    therapistGender: $scope.booking.gender,
                    treatmentDate: $filter('date')($scope.treatmentDate, 'yyyy/MM/dd')
                };

                var request = $http({
                    method: 'post',
                    url: API.availableTimes,
                    data: $.param(requestData),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });

                request.success(function (data) {
                    if (data && !data.result) {
                        $scope.availableTimes = data.times;
                        $scope.timepicker = true;
                        $scope.apiErrorTime = undefined;
                    } else {
                        $scope.apiErrorTime = data;
                    }
                    $scope.gettingAvailableTime = false;
                });

                request.error(function () {
                    $scope.apiErrorTime = {
                        result: 'unknown'
                    };
                    $scope.gettingAvailableTime = false;
                });
            };

            function parseDates(dates) {
                var parsedDates = [];
                for (var i = 0; i < dates.length; i++) {
                    var d = new Date(dates[i]);
                    parsedDates.push(d.setHours(0, 0, 0, 0));
                }
                return parsedDates;
            }

            $scope.disableDates = function (date) {
                var invalid = parseDates($scope.disabledDates);
                if (!$scope.booking.package) {
                    return true;
                }
                return invalid.indexOf(date.setHours(0, 0, 0, 0)) !== -1;
            };

            $scope.setTreatmentType = function (type, label) {
                $scope.booking.type = type;
                $scope.treatmentType = label;
                $timeout(function () {
                    $('[name="booking.package"]').parent('.field').find('.dropdown-toggle').focus();
                }, 10);
            };

            $scope.setTreatmentPackage = function (pkg, label) {
                $scope.booking.package = pkg;
                $scope.treatmentPackage = label;
            };

            $scope.getTreatmentDuration = function (name) {
                return name.match(/\(([^)]*)\)/) ? name.match(/\(([^)]*)\)/)[1] : '';
            };

            $scope.setTherapistGender = function (gender, label) {
                $scope.booking.gender = gender;
                $scope.therapistGender = label;
                $scope.genderDropdown = !$scope.genderDropdown;
            };

            $scope.treatmentTime = '';

            $scope.disabledTimes = [];

            $scope.availableTimes = timepickerConfig.timeOptions;

            $scope.setTreatmentTime = function (hours) {
                if ($scope.treatmentDate) {
                    var h = hours.split(':');
                    $scope.booking.datetime = $scope.treatmentDate.setHours(h[0], h[1], 0, 0);
                    $scope.treatmentTime = hours;
                }
                $scope.timesDropdown = !$scope.timesDropdown;
            };

            $scope.ampmTime = function (time) {
                var d = new Date();
                var h = time.split(':');
                return d.setHours(h[0], h[1], 0, 0);
            };

            $scope.setPatientTitle = function (title, label) {
                $scope.booking.title = title;
                $scope.patientTitle = label;
                $timeout(function () {
                    $('[name="booking.firstname"]').focus();
                });
            };

            $scope.setCreditCardYear = function (year, label) {
                $scope.booking.ccyear = year;
                $scope.patientCCYear = label;
            };

            $scope.setCreditCardMonth = function (month, label) {
                $scope.booking.ccmonth = month;
                $scope.patientCCMonth = label;
                $timeout(function () {
                    $('[name="booking.ccyear"]').parent('.field').find('.dropdown-toggle').focus();
                });
            };

            $scope.setHotelStay = function (value, label) {
                $scope.booking.hotel = value;
                $scope.hotel = label;

            };            

            // $scope.regexPhone = /(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*(\d{1,2})$/;
            $scope.regexPhone = /^[\d -]+$/;
            $scope.regexCCNumber = (function () {
                var regexp = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
                return {
                    test: function (value) {
                        value = value.replace(/ /g, '');
                        return regexp.test(value);
                    }
                };
            })();
            $scope.regexEnglish = /^[a-zA-Z\-'\s]+$/;

            $scope.hideNumbers = function (number) {
                return number.replace(/.(?=.{5})/g, '*');
            };

            var requiredFields1 = [
                'booking.type',
                'booking.package',
                'booking.datetime'
            ];

            var requiredFields2 = [
                'booking.title',
                'booking.firstname',
                'booking.lastname',
                'booking.mobile',
                'booking.email',
                'booking.ccname',
                'booking.ccnumber',
                'booking.ccyear',
                'booking.ccmonth',
                'booking.hotel'
            ];

            $scope.$watchGroup(requiredFields1, function (newValues) {
                $scope.pageIsValid1 = newValues.every(Boolean);
            });

            $scope.$watchGroup(requiredFields2, function (newValues) {

                var condition = [];

                requiredFields2.forEach(function (val) {
                    condition.push($scope.bookingForm[val].$valid);
                });

                $scope.pageIsValid2 = condition.every(Boolean) && newValues.every(Boolean);

            });

            var requisiteDatePicker = [
                'booking.type',
                'booking.package',
                'booking.gender'
            ];

            $scope.$watchGroup(requisiteDatePicker, function (newValues) {

                if (newValues.every(Boolean)) {

                    $scope.updateDatePicker();
                    $scope.treatmentDate = '';

                }

            });

            $scope.$watch('booking.type', function () {
                $scope.booking.package = undefined;
                $scope.treatmentPackage = undefined;
            });

            $scope.$watch('treatmentDate', function () {
                $scope.treatmentTime = '';
                $scope.booking.datetime = '';
                $scope.updateTimePicker();
            });

            $scope.$watch('booking.package', function (val) {
                if (val) {
                    var treatment = $filter('filter')($scope.treatmentPackages, {TemplateID: val});
                    $scope.treatmentDescription = $sce.trustAsHtml(treatment[0].Description);
                    $scope.treatmentPrice = treatment[0].ChargeAmount;
                }
            });

            var ccExpires = [
                'booking.datetime',
                'booking.ccmonth',
                'booking.ccyear'
            ];

            $scope.$watchGroup(ccExpires, function () {
                var d = new Date();
                var bookingDateTime = new Date($scope.booking.datetime);
                d.setMonth($scope.booking.ccmonth);
                d.setYear($scope.booking.ccyear);
                d.setDate(bookingDateTime.getDate() + 1);
                d.setHours(0, 0, 0, 0);
                $scope.ccExpire = d;
            });

            $scope.bookingFormSubmit = function () {

                $scope.bookingFormSubmitting = true;

                // map to server variables
                var bookingData = {
                    languageCode: API.languageCode,
                    hotelCode: $scope.booking.hotelCode,
                    templateID: $scope.booking.package,
                    treatmentDate: $filter('date')($scope.booking.datetime, 'yyyy/MM/dd'),
                    treatmentTime: $filter('date')($scope.booking.datetime, 'HH:mm'),
                    therapistGender: $scope.booking.gender,
                    categoryId: $scope.booking.type,
                    title: $scope.booking.title,
                    firstName: $scope.booking.firstname,
                    lastName: $scope.booking.lastname,
                    mobile: $scope.booking.mobile,
                    email: $scope.booking.email,
                    cardHolderName: $scope.booking.ccname,
                    cardNumber: $scope.booking.ccnumber,
                    //cardExpiryMM: $scope.booking.ccmonth,
                    cardExpiryMM: $scope.booking.ccmonth < 9 ? '0' + (parseInt($scope.booking.ccmonth) + 1) : (parseInt($scope.booking.ccmonth) + 1),
                    cardExpiryYY: $scope.booking.ccyear,
                    staying: $scope.booking.hotel || 'no',
                    specialRequest: $scope.booking.request || '',
                    subscribe: $scope.booking.subscribe || 'no'
                };

                var request = $http({
                    method: 'post',
                    url: API.bookingFormSubmit,
                    data: $.param(bookingData),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });

                request.success(function (data) {
                    if (data && data.result === 'success') {
                        $scope.submitSuccess = data;
                        $scope.activeFormPage = 4;
                    }
                    else {
                        $scope.apiErrorSubmit = data.error;
                    }
                    $scope.bookingFormSubmitting = false;
                });

                request.error(function () {
                    $scope.apiErrorSubmit = {
                        result: 'unknown'
                    };
                    $scope.bookingFormSubmitting = false;
                });

            };

        });

})();

(function () {
    /**
     * Decorates the ui-bootstrap datepicker directive's controller to allow
     * refreshing the datepicker view (and rerunning invalid dates function)
     * upon an event trigger: `$scope.$broadcast('refreshDatepickers');`
     *
     * Works with inline and popup. Include this after `ui.bootstrap` js
     */

    'use strict';

    angular.module('ui.bootstrap.datepicker')
        .config(function ($provide) {
            $provide.decorator('datepickerDirective', function ($delegate) {
                var directive = $delegate[0];
                var link = directive.link;

                directive.compile = function () {
                    return function (scope, element, attrs, ctrls) {
                        link.apply(this, arguments);

                        var datepickerCtrl = ctrls[0];
                        var ngModelCtrl = ctrls[1];

                        if (ngModelCtrl) {
                            // Listen for 'refreshDatepickers' event...
                            scope.$on('refreshDatepickers', function refreshView() {
                                datepickerCtrl.refreshView();
                            });
                        }
                    };
                };
                return $delegate;
            });
        });

    angular.module('template/datepicker/day.html', [])
        .run(['$templateCache', function ($templateCache) {
            $templateCache.put('template/datepicker/day.html',
                '<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\" class=\"datepicker\">\n' +
                '  <thead>\n' +
                '    <tr>\n' +
                '      <th><button type=\"button\" class=\"datepicker__prevmonth\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"icon icon--lsaquo\"></i></button></th>\n' +
                '      <th colspan=\"{{5 + showWeeks}}\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default datepicker__month btn-sm\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n' +
                '      <th><button type=\"button\" class=\"datepicker__nextmonth\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"icon icon--rsaquo\"></i></button></th>\n' +
                '    </tr>\n' +
                '    <tr>\n' +
                '      <th ng-show=\"showWeeks\" class=\"text-center\"></th>\n' +
                '      <th ng-repeat=\"label in labels track by $index\" class=\"text-center\"><small aria-label=\"{{label.full}}\">{{label.abbr}}</small></th>\n' +
                '    </tr>\n' +
                '  </thead>\n' +
                '  <tbody>\n' +
                '    <tr ng-repeat=\"row in rows track by $index\">\n' +
                '      <td ng-show=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n' +
                '      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\" ng-class=\"dt.customClass\">\n' +
                '        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{\'btn-info\': dt.selected, active: isActive(dt), invisible: dt.secondary }\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{\'text-muted\': dt.secondary, \'text-info\': dt.current}\">{{dt.label}}</span></button>\n' +
                '      </td>\n' +
                '    </tr>\n' +
                '  </tbody>\n' +
                '</table>\n' +
                '');
        }]);

})();
