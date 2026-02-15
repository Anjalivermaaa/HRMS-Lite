from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer, AttendanceListSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                'status': 'success',
                'status_code': status.HTTP_201_CREATED,
                'message': 'Employee created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'status_code': status.HTTP_400_BAD_REQUEST,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'status_code': status.HTTP_200_OK,
            'message': 'Employees retrieved successfully',
            'data': serializer.data,
            'count': queryset.count()
        })
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({
                'status': 'success',
                'status_code': status.HTTP_200_OK,
                'message': 'Employee retrieved successfully',
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'status_code': status.HTTP_404_NOT_FOUND,
                'message': 'Employee not found',
                'errors': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                'status': 'success',
                'status_code': status.HTTP_200_OK,
                'message': 'Employee deleted successfully',
                'data': {'id': kwargs.get('pk')}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'status_code': status.HTTP_404_NOT_FOUND,
                'message': 'Employee not found',
                'errors': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        try:
            total_employees = Employee.objects.count()
            departments = Employee.objects.values('department').annotate(count=Count('id'))
            
            # Calculate department percentages
            dept_summary = []
            for dept in departments:
                dept['percentage'] = round((dept['count'] / total_employees * 100), 2) if total_employees > 0 else 0
                dept_summary.append(dept)
            
            return Response({
                'status': 'success',
                'status_code': status.HTTP_200_OK,
                'message': 'Summary retrieved successfully',
                'data': {
                    'total_employees': total_employees,
                    'departments': dept_summary
                }
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'Failed to retrieve summary',
                'errors': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update' or self.action == 'partial_update':
            return AttendanceSerializer
        return AttendanceListSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                'status': 'success',
                'status_code': status.HTTP_201_CREATED,
                'message': 'Attendance marked successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        # Format validation errors for better frontend handling
        errors = {}
        for field, field_errors in serializer.errors.items():
            errors[field] = field_errors[0] if isinstance(field_errors, list) else field_errors
        
        # Get the first error message to use as the main message
        first_error = next(iter(errors.values())) if errors else 'Validation error'
        
        return Response({
            'status': 'error',
            'status_code': status.HTTP_400_BAD_REQUEST,
            'message': first_error,
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'status_code': status.HTTP_200_OK,
            'message': 'Attendance records retrieved successfully',
            'data': serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=False, methods=['get'])
    def employee_attendance(self, request):
        employee_id = request.query_params.get('employee_id')
        if not employee_id:
            return Response({
                'status': 'error',
                'status_code': status.HTTP_400_BAD_REQUEST,
                'message': 'Missing required parameter',
                'errors': {'employee_id': 'Employee ID parameter is required'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            employee = Employee.objects.get(employee_id=employee_id)
        except Employee.DoesNotExist:
            return Response({
                'status': 'error',
                'status_code': status.HTTP_404_NOT_FOUND,
                'message': 'Employee not found',
                'errors': {'employee_id': f"Employee with ID '{employee_id}' does not exist"}
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        attendances = Attendance.objects.filter(employee=employee)
        
        if start_date:
            try:
                datetime.strptime(start_date, '%Y-%m-%d')
                attendances = attendances.filter(date__gte=start_date)
            except ValueError:
                return Response({
                    'status': 'error',
                    'status_code': status.HTTP_400_BAD_REQUEST,
                    'message': 'Invalid date format',
                    'errors': {'start_date': 'Use YYYY-MM-DD format'}
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if end_date:
            try:
                datetime.strptime(end_date, '%Y-%m-%d')
                attendances = attendances.filter(date__lte=end_date)
            except ValueError:
                return Response({
                    'status': 'error',
                    'status_code': status.HTTP_400_BAD_REQUEST,
                    'message': 'Invalid date format',
                    'errors': {'end_date': 'Use YYYY-MM-DD format'}
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AttendanceListSerializer(attendances, many=True)
        
        # Calculate summary
        total_days = attendances.count()
        present_days = attendances.filter(status='Present').count()
        absent_days = attendances.filter(status='Absent').count()
        
        return Response({
            'status': 'success',
            'status_code': status.HTTP_200_OK,
            'message': 'Employee attendance retrieved successfully',
            'data': {
                'employee': {
                    'id': employee.id,
                    'employee_id': employee.employee_id,
                    'full_name': employee.full_name,
                    'email': employee.email,
                    'department': employee.department
                },
                'attendances': serializer.data,
                'summary': {
                    'total_days': total_days,
                    'present_days': present_days,
                    'absent_days': absent_days,
                    'attendance_rate': round((present_days / total_days * 100), 2) if total_days > 0 else 0
                }
            }
        })
    
    @action(detail=False, methods=['get'])
    def date_attendance(self, request):
        date = request.query_params.get('date')
        if not date:
            return Response({
                'status': 'error',
                'status_code': status.HTTP_400_BAD_REQUEST,
                'message': 'Missing required parameter',
                'errors': {'date': 'Date parameter is required (YYYY-MM-DD)'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'status': 'error',
                'status_code': status.HTTP_400_BAD_REQUEST,
                'message': 'Invalid date format',
                'errors': {'date': 'Use YYYY-MM-DD format'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        attendances = Attendance.objects.filter(date=parsed_date)
        serializer = AttendanceListSerializer(attendances, many=True)
        
        present_count = attendances.filter(status='Present').count()
        absent_count = attendances.filter(status='Absent').count()
        
        # Get total employees for this date
        total_employees = Employee.objects.count()
        
        return Response({
            'status': 'success',
            'status_code': status.HTTP_200_OK,
            'message': 'Date attendance retrieved successfully',
            'data': {
                'date': date,
                'attendances': serializer.data,
                'summary': {
                    'total_marked': attendances.count(),
                    'present': present_count,
                    'absent': absent_count,
                    'not_marked': total_employees - attendances.count()
                }
            }
        })
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's attendance"""
        today = timezone.now().date()
        return self.date_attendance(request._request)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get attendance summary for a date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response({
                'status': 'error',
                'status_code': status.HTTP_400_BAD_REQUEST,
                'message': 'Missing required parameters',
                'errors': {
                    'start_date': 'Start date is required',
                    'end_date': 'End date is required'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            start_parsed = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_parsed = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'status': 'error',
                'status_code': status.HTTP_400_BAD_REQUEST,
                'message': 'Invalid date format',
                'errors': {'date': 'Use YYYY-MM-DD format'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get attendance for date range
        attendances = Attendance.objects.filter(date__range=[start_parsed, end_parsed])
        
        # Calculate summary by employee
        employee_summary = []
        employees = Employee.objects.all()
        
        for employee in employees:
            emp_attendances = attendances.filter(employee=employee)
            total = emp_attendances.count()
            present = emp_attendances.filter(status='Present').count()
            
            employee_summary.append({
                'employee_id': employee.employee_id,
                'employee_name': employee.full_name,
                'department': employee.department,
                'total_days': total,
                'present_days': present,
                'absent_days': total - present,
                'attendance_rate': round((present / total * 100), 2) if total > 0 else 0
            })
        
        return Response({
            'status': 'success',
            'status_code': status.HTTP_200_OK,
            'message': 'Attendance summary retrieved successfully',
            'data': {
                'date_range': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'total_records': attendances.count(),
                'employee_summary': employee_summary
            }
        })